// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest, requireRoleFromRequest } from "@steward-web/auth/server";
import {
  LexicalDocumentView,
  sameContent,
  type SerializedDocument,
  serializeDocument,
  type StewardEditorHandle,
} from "@steward-web/editor-steward";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Card, Tabs, TabsContent, TabsList, TabsTrigger } from "@steward-web/ui";
import { draftPath } from "@steward-web/ui/domain";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/drafts.$number.appendices.$letter";

import { appendixDocument } from "../authoring/appendixDocument";
import {
  getPolicyByNumber,
  issueAppendixToken,
  listAppendices,
  publishAppendix,
  restoreAppendix,
  retireAppendix,
  saveAppendix,
} from "../authoring/authoring.server";
import { settleTokenRequests, type TokenRequest } from "../authoring/collab/token";
import { type CollabToken, useCollabSession } from "../authoring/collab/useCollabSession";
import { DraftDocumentEditor } from "../authoring/DraftDocumentEditor";
import { SaveState, type SaveStateKind } from "../authoring/EditorChrome";
import { EditorViewToggle, useEditorView } from "../authoring/EditorViewToggle";
import { useAutosave } from "../authoring/useAutosave";

/** Changes the editor reports while it waits for its room are not the document: it is still empty. */
const ignoreWhileConnecting = () => {};

/** How long the content must be still before the appendix saves itself. */
const AUTOSAVE_AFTER_MS = 2000;

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const identity = await requireRoleFromRequest(request, PERMISSIONS.PolicyAuthor, "author");
  const policy = await getPolicyByNumber(request, params.number);
  if (!policy?.viewerCan.edit) throw new Response("Not Found", { status: 404 });
  const appendices = await listAppendices(request, policy.id);
  // A live appendix is opened by its letter; a retired one has none, so by its id.
  const appendix = appendices.find(
    (a) => a.letter?.toUpperCase() === params.letter.toUpperCase() || a.id === params.letter,
  );
  if (!appendix) throw new Response("Not Found", { status: 404 });
  return { appendix, meId: identity.id, policy };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const policy = await getPolicyByNumber(request, params.number);
  if (!policy?.viewerCan.edit) throw new Response("Not Found", { status: 404 });
  const appendices = await listAppendices(request, policy.id);
  const appendix = appendices.find(
    (a) => a.letter?.toUpperCase() === params.letter.toUpperCase() || a.id === params.letter,
  );
  if (!appendix) throw new Response("Not Found", { status: 404 });
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  try {
    switch (intent) {
      case "collab-token": {
        const issued = await issueAppendixToken(request, appendix.id);
        return data({ intent, ok: true, ...issued });
      }
      case "publish": {
        await publishAppendix(request, appendix.id);
        return data({ intent, ok: true });
      }
      case "restore": {
        await restoreAppendix(request, appendix.id);
        return data({ intent, ok: true });
      }
      case "retire": {
        await retireAppendix(request, appendix.id);
        // Not back to this address: it holds a letter, the live appendices are renumbered, and
        // the same address would open the next one (bug log 244).
        return redirect(draftPath(params.number));
      }
      case "save": {
        await saveAppendix(
          request,
          appendix.id,
          String(form.get("title") ?? ""),
          String(form.get("contentJson") ?? ""),
        );
        return data({ intent, ok: true });
      }
      default: {
        throw new Response("Bad Request", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ error: refusalOf(error), intent, ok: false as const }, { status: 400 });
  }
};

export default function AppendixRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const { appendix, meId, policy } = loaderData;
  const current = appendix.draft ?? appendix.published;
  const retired = Boolean(appendix.retiredAt);
  const initialDocument = appendixDocument(current?.contentJson);
  const [title, setTitle] = useState(current?.title ?? "");
  const [content, setContent] = useState<SerializedDocument>(initialDocument);
  const contentRef = useRef(initialDocument);
  const editorRef = useRef<null | StewardEditorHandle>(null);
  const [lastSaved, setLastSaved] = useState(serializeDocument(initialDocument));
  const [touched, setTouched] = useState(false);
  const touchedRef = useRef(false);
  const [editorReady, setEditorReady] = useState(false);
  const saveFetcher = useFetcher<typeof action>();
  const actionFetcher = useFetcher<typeof action>();

  // The appendix's own co-editing room: asked for through this page's action, one token at a time.
  const collabFetcher = useFetcher<typeof action>();
  const collabResolvers = useRef<TokenRequest[]>([]);
  useEffect(() => {
    if (collabFetcher.state !== "idle" || !collabFetcher.data) return;
    if (collabFetcher.data.ok && "token" in collabFetcher.data) {
      settleTokenRequests(collabResolvers.current, {
        token: {
          expiresAt: collabFetcher.data.expiresAt,
          token: collabFetcher.data.token,
          wsUrl: collabFetcher.data.wsUrl,
        },
      });
    } else {
      settleTokenRequests(collabResolvers.current, {
        error: new Error("the collab token request was refused"),
      });
    }
  }, [collabFetcher.data, collabFetcher.state]);
  const getCollabToken = useCallback(
    (): Promise<CollabToken> =>
      new Promise((resolve, reject) => {
        collabResolvers.current.push({ reject, resolve });
        collabFetcher.submit({ intent: "collab-token" }, { method: "post" });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `collabFetcher` is stable per mount
    [appendix.id],
  );
  const getCollabContentJSON = useCallback(() => serializeDocument(contentRef.current), []);
  const [collabNotice, setCollabNotice] = useState<null | string>(null);
  const onCollabSnapshotRejected = useCallback((message: string) => {
    setCollabNotice(`Not saved collaboratively: ${message}`);
  }, []);
  const collabCallbacks = useMemo(
    () => ({
      getContentJSON: getCollabContentJSON,
      getToken: getCollabToken,
      onSnapshotRejected: onCollabSnapshotRejected,
    }),
    [getCollabContentJSON, getCollabToken, onCollabSnapshotRejected],
  );
  const collabSession = useCollabSession(retired ? null : appendix.id, collabCallbacks);
  const { touch: touchCollab } = collabSession;

  const markTouched = useCallback(() => {
    touchedRef.current = true;
    setTouched(true);
  }, []);
  // Until the person touches the editor, what it reports is the document as loaded, so a page
  // never opens as "Unsaved changes"; the room's content counts the same once it arrives.
  const onDocumentChange = useCallback(
    (next: SerializedDocument) => {
      contentRef.current = next;
      setContent(next);
      if (!touchedRef.current) setLastSaved(serializeDocument(next));
      touchCollab();
    },
    [touchCollab],
  );
  useEffect(() => {
    if (collabSession.mode === "pending" || !editorRef.current) return;
    if (collabSession.mode === "live" && !touchedRef.current) {
      const reported = editorRef.current.getDocument();
      contentRef.current = reported;
      setContent(reported);
      setLastSaved(serializeDocument(reported));
    }
    setEditorReady(true);
  }, [collabSession.mode]);

  const serialized = serializeDocument(content);
  const titleChanged = title !== (current?.title ?? "");
  const dirty = !sameContent(serialized, lastSaved) || titleChanged;
  const saving = saveFetcher.state !== "idle";
  const saveState: SaveStateKind = saving ? "saving" : dirty ? "unsaved" : "saved";

  const save = useCallback(() => {
    setLastSaved(serialized);
    void saveFetcher.submit({ contentJson: serialized, intent: "save", title }, { method: "post" });
  }, [saveFetcher, serialized, title]);

  useAutosave({
    content: `${title}\n${serialized}`,
    delayMs: AUTOSAVE_AFTER_MS,
    enabled: editorReady && touched && !retired,
    save,
    saved: !dirty,
    saving,
  });

  const published = appendix.published;
  const contributors = appendix.contributors ?? [];
  // each person's own view, on Diff to begin with: the draft shows what it changes (bug log 223)
  const [editorView, setEditorView] = useEditorView(meId, "diff");
  const publishedDocument = useMemo(
    () => (published ? appendixDocument(published.contentJson) : undefined),
    [published],
  );
  const contributorsLabel = useId();
  const [tab, setTab] = useState("draft");
  // the published rows, latest first; the Published tab opens on the latest
  const versions = appendix.publishedVersions?.length
    ? appendix.publishedVersions
    : published
      ? [published]
      : [];
  const [shownVersion, setShownVersion] = useState<string>();
  const shown = versions.find((version) => version.id === shownVersion) ?? versions[0];
  const hasDraft = Boolean(appendix.draft) || dirty;
  const letter = appendix.letter ?? "";

  return (
    <div className="flex flex-col gap-3.5 px-4 pt-[22px] pb-8 text-ink sm:px-8">
      <Link
        className="text-sm font-medium text-muted hover:underline"
        to={draftPath(policy.number)}
      >
        {t("editor.appendix.back", { title: policy.title })}
      </Link>
      <div className="flex flex-wrap items-start gap-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 className="font-serif text-[30px] leading-[38px] font-semibold">
            {letter ? `${letter}. ` : ""}
            {title || current?.title}
          </h1>
          <span className="flex flex-wrap items-center gap-2.5 text-sm text-muted">
            <span className="font-mono">{policy.number}</span>
            <span>
              {published
                ? t("editor.appendix.publishedAt", {
                    when: new Date(published.publishedAt ?? "").toLocaleDateString(),
                  })
                : t("editor.appendix.unpublished")}
            </span>
            <SaveState state={saveState} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {retired ? (
            <actionFetcher.Form method="post">
              <input name="intent" type="hidden" value="restore" />
              <Button type="submit" variant="secondary">
                {t("editor.appendix.restore")}
              </Button>
            </actionFetcher.Form>
          ) : (
            <>
              <actionFetcher.Form method="post">
                <input name="intent" type="hidden" value="retire" />
                <Button type="submit" variant="secondary">
                  {t("editor.appendix.retire")}
                </Button>
              </actionFetcher.Form>
              <actionFetcher.Form method="post">
                <input name="intent" type="hidden" value="publish" />
                <Button disabled={!hasDraft || dirty || saving} type="submit">
                  {t("editor.appendix.publish")}
                </Button>
              </actionFetcher.Form>
            </>
          )}
        </div>
      </div>

      <Banner title={t("editor.appendix.supporting")} tone="info" />
      {retired ? <Banner title={t("editor.appendix.retired")} tone="warn" /> : null}
      {saveFetcher.data && !saveFetcher.data.ok ? (
        <Banner title={t("editor.appendix.failed")} tone="warn" />
      ) : null}
      {collabNotice ? <Banner title={collabNotice} tone="warn" /> : null}

      {contributors.length > 0 ? (
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted">
          <span id={contributorsLabel}>{t("editor.appendix.contributors.label")}</span>
          <ul aria-labelledby={contributorsLabel} className="flex flex-wrap gap-x-3">
            {contributors.map((person) => (
              <li key={person.userId}>
                {person.active
                  ? person.name
                  : t("editor.appendix.contributors.former", { name: person.name })}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Tabs onValueChange={setTab} value={published ? tab : "draft"}>
        <TabsList>
          <TabsTrigger value="draft">{t("editor.appendix.tabs.draft")}</TabsTrigger>
          <TabsTrigger empty={!published} value="published">
            {t("editor.appendix.tabs.published")}
          </TabsTrigger>
        </TabsList>
        {/* kept mounted while the Published tab shows: leaving the editor would drop the live
            document and its room, and it comes back from the saved text */}
        <TabsContent
          className="flex flex-col gap-3"
          forceMount
          hidden={published ? tab !== "draft" : false}
          value="draft"
        >
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t("editor.appendix.titleLabel")}
            <input
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-base font-normal"
              onChange={(event) => {
                setTouched(true);
                setTitle(event.target.value);
              }}
              readOnly={retired}
              value={title}
            />
          </label>
          {publishedDocument ? (
            <div className="flex justify-end">
              <EditorViewToggle onChange={setEditorView} value={editorView} />
            </div>
          ) : null}
          <Card className="isolate w-full px-6 py-8 sm:px-12 sm:py-8">
            <div
              onBeforeInputCapture={markTouched}
              onClickCapture={markTouched}
              onKeyDownCapture={markTouched}
              onPasteCapture={markTouched}
            >
              <DraftDocumentEditor
                collaboration={collabSession.mode === "solo" ? null : collabSession.collaboration}
                connecting={collabSession.mode === "pending"}
                initialDocument={initialDocument}
                // a room that fell back to solo needs a fresh editor without it
                key={collabSession.mode === "solo" ? "solo" : "room"}
                liveDiff={
                  editorView === "diff" && publishedDocument
                    ? { published: publishedDocument }
                    : null
                }
                onChange={
                  collabSession.mode === "pending" ? ignoreWhileConnecting : onDocumentChange
                }
                onReady={(handle) => {
                  editorRef.current = handle;
                  if (collabSession.mode !== "pending") setEditorReady(true);
                }}
                readOnly={retired}
              />
            </div>
          </Card>
        </TabsContent>
        {published ? (
          <TabsContent className="flex flex-col gap-3" value="published">
            <label className="flex flex-col gap-1 text-sm font-medium">
              {t("editor.appendix.version.choose")}
              <select
                className="h-10 w-full max-w-sm rounded-md border border-border bg-surface px-3 text-base font-normal"
                onChange={(event) => setShownVersion(event.target.value)}
                value={shown?.id}
              >
                {versions.map((version, index) => (
                  <option key={version.id} value={version.id}>
                    {t(
                      index === 0
                        ? "editor.appendix.version.latest"
                        : "editor.appendix.version.earlier",
                      {
                        version: version.versionNo,
                        when: new Date(version.publishedAt ?? "").toLocaleDateString(),
                      },
                    )}
                  </option>
                ))}
              </select>
            </label>
            <Card className="isolate w-full px-6 py-8 sm:px-12 sm:py-8">
              <h2 className="mb-3 font-serif text-xl font-semibold">{shown?.title}</h2>
              <LexicalDocumentView document={appendixDocument(shown?.contentJson)} />
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
