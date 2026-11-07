import type { AiJobStage } from "@steward-web/ui/domain";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { AssistOperation } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest, requireRoleFromRequest } from "@steward-web/auth/server";
import {
  parseDocument,
  type ReworkChoice,
  type ReworkRequest,
  sameContent,
  type SerializedDocument,
  serializeDocument,
  type StewardEditorHandle,
} from "@steward-web/editor-steward";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Card, scrollBehavior, StatusPill } from "@steward-web/ui";
import { draftPath, RecordBreadcrumb } from "@steward-web/ui/domain";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { data, redirect, useFetcher, useLocation, useNavigate } from "react-router";

import type { Route } from "./+types/drafts.$number";

import { authoringAssist, getAiHealth, submitPolicyReview } from "../authoring/ai.server";
import { AiReviewSheet, RewriteSectionDialog, SuggestionSheet } from "../authoring/ai/AiOverlays";
import { type ChangeEntry, parseReviewResult } from "../authoring/ai/results";
import { useAiJob } from "../authoring/ai/useAiJob";
import {
  addAppendix,
  deleteAppendix,
  discardDraft,
  getDraftVersion,
  getLatestTemplateVersion,
  getPolicyByNumber,
  isDraftInReview,
  policyIdOfNumber,
  reorderAppendices,
  saveDraft,
  startDraft,
  submitDraftForReview,
  updateAppendix,
} from "../authoring/authoring.server";
import { issueCollabToken } from "../authoring/collab/collab.server";
import { settleTokenRequests, type TokenRequest } from "../authoring/collab/token";
import { type CollabToken, useCollabSession } from "../authoring/collab/useCollabSession";
import { DraftDocumentEditor } from "../authoring/DraftDocumentEditor";
import { ActionsMenu, AiMenu, SubmitForApproval } from "../authoring/EditorActions";
import {
  AppendicesPanel,
  EditorHeader,
  NextVersion,
  Presence,
  type PresenceState,
  RequiredSections,
  type SaveStateKind,
} from "../authoring/EditorChrome";
import {
  aiSections,
  applyAiText,
  applyChangeSet,
  draftDocument,
  missingRequiredSections,
  resetRequiredSections,
} from "../authoring/sections";
import { useAiHealth } from "../authoring/useAiHealth";
import { useAutosave } from "../authoring/useAutosave";
import { listReviewThreads } from "../review/reviewThreads.server";
import { useReviewComments } from "../review/useReviewComments";

/** A section as the AI forms post it: its key, title and plain text. */
interface SectionPayload {
  sectionKey: string;
  text: string;
  title: string;
}

/** How long the content must be still before the draft saves itself. */
const AUTOSAVE_AFTER_MS = 2000;

/** Changes the editor reports while it waits for its room are not the document: it is still empty. */
const ignoreWhileConnecting = () => {};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const identity = await requireRoleFromRequest(request, PERMISSIONS.PolicyAuthor, "author");
  const [policy, aiHealth] = await Promise.all([
    getPolicyByNumber(request, params.number),
    getAiHealth(request).catch(() => ({ available: false, reason: "ai_service_unavailable" })),
  ]);
  if (!policy?.viewerCan.edit) throw new Response("Not Found", { status: 404 });
  const [draft, templateVersion] = await Promise.all([
    getDraftVersion(request, policy.id),
    policy.templateId ? getLatestTemplateVersion(request, policy.templateId) : null,
  ]);
  const inReview = draft ? await isDraftInReview(request, draft) : false;
  // What approvers wrote on this version, shown on the text they wrote it on.
  const threads = draft ? await listReviewThreads(request, draft.id) : [];
  return { aiHealth, draft, inReview, meId: identity.id, policy, templateVersion, threads };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const policyId = await policyIdOfNumber(request, params.number);
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "add-appendix": {
        const policyVersionId = String(form.get("policyVersionId") ?? "");
        await addAppendix(
          request,
          policyVersionId,
          "Untitled appendix",
          JSON.stringify({ text: "" }),
        );
        return data({ intent, ok: true } as const);
      }
      case "assist": {
        const sectionKey = String(form.get("sectionKey") ?? "");
        const result = await authoringAssist(request, {
          editableContent: String(form.get("editableContent") ?? ""),
          instruction: String(form.get("instruction") ?? "") || undefined,
          operation: String(
            form.get("operation") ?? AssistOperation.AssistOperationDraft,
          ) as AssistOperation,
          policyId,
          sectionKey,
          versionId: String(form.get("versionId") ?? ""),
        });
        return data({ intent, ok: true, sectionKey, suggestion: result.suggestion } as const);
      }
      case "collab-token": {
        const draftId = String(form.get("draftId") ?? "");
        const templateVersionId = String(form.get("templateVersionId") ?? "") || null;
        const payload = await issueCollabToken(request, policyId, draftId, templateVersionId);
        return data({ intent, ok: true, ...payload } as const);
      }
      case "delete-appendix": {
        await deleteAppendix(request, String(form.get("appendixId") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "discard": {
        await discardDraft(request, policyId);
        return data({ intent, ok: true } as const);
      }
      case "edit": {
        // Edit from the reader: make sure there is a working draft (from the published version
        // when there is none), then open the editor on it.
        const started = await startDraft(request, policyId);
        if (!started) throw new Response("Not Found", { status: 404 });
        return redirect(draftPath(params.number));
      }
      case "reorder-appendices": {
        const orderedIds = String(form.get("orderedIds") ?? "")
          .split(",")
          .filter(Boolean);
        await reorderAppendices(request, String(form.get("policyVersionId") ?? ""), orderedIds);
        return data({ intent, ok: true } as const);
      }
      case "review": {
        const sections = JSON.parse(String(form.get("sectionsJson") ?? "[]")) as SectionPayload[];
        const { jobId } = await submitPolicyReview(request, {
          policyId,
          sections: sections.map((s) => ({ content: s.text, key: s.sectionKey, title: s.title })),
          versionId: String(form.get("versionId") ?? ""),
        });
        return data({ intent, jobId, ok: true } as const);
      }
      case "save": {
        // The editor's serialized state. Refuse anything that isn't one rather than store it.
        const document = parseDocument(String(form.get("contentJson") ?? ""));
        if (!document) throw new Response("Bad Request", { status: 400 });
        const templateVersionId = String(form.get("templateVersionId") ?? "") || null;
        await saveDraft(request, policyId, serializeDocument(document), templateVersionId);
        return data({ intent, ok: true } as const);
      }
      case "submit-review": {
        const { runId } = await submitDraftForReview(request, policyId);
        return data({ intent, ok: true, runId } as const);
      }
      case "update-appendix": {
        const id = String(form.get("appendixId") ?? "");
        const title = String(form.get("title") ?? "");
        const text = String(form.get("text") ?? "");
        await updateAppendix(request, id, title, JSON.stringify({ text }));
        return data({ intent, ok: true } as const);
      }
      default: {
        throw new Response("Bad Request", { status: 400 });
      }
    }
  } catch (error) {
    return data({ error: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

export default function DraftEditor({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const { t: tAi } = useTranslation("ai");
  const location = useLocation();
  const navigate = useNavigate();
  const { draft, inReview, meId, policy, templateVersion, threads } = loaderData;
  const comments = useReviewComments({
    canAdd: false,
    meId,
    policyVersionId: draft?.id ?? "",
    threads,
  });
  const aiHealth = useAiHealth({
    available: loaderData.aiHealth.available,
    reason: loaderData.aiHealth.reason ?? null,
  });

  const outline = templateVersion?.sections ?? [];

  // The document the editor opens with, and the one it holds now (kept current from the
  // editor's own change events, remote edits included).
  const [initialDocument] = useState(() => draftDocument(draft?.contentJson, outline));
  const [content, setContent] = useState<SerializedDocument>(initialDocument);
  const contentRef = useRef(initialDocument);
  const editorRef = useRef<null | StewardEditorHandle>(null);
  const [rewriteOpen, setRewriteOpen] = useState(false);
  // What the open suggestion is about: one section, or the selection in the editor.
  const [suggestionFor, setSuggestionFor] = useState<
    | { key: string; kind: "section"; original: string }
    | { kind: "selection"; original: string }
    | null
  >(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSeen, setReviewSeen] = useState<null | string>(null);
  const [aiNotice, setAiNotice] = useState<null | string>(null);
  // What the page last saved, to tell "Saved" from "Unsaved changes" (U11).
  const [lastSaved, setLastSaved] = useState(() => serializeDocument(initialDocument));
  const saveFetcher = useFetcher<typeof action>();
  // A successful save makes what it sent the saved content. Adjusted during render on the
  // response the page hasn't seen yet, not in an effect.
  const [seenSave, setSeenSave] = useState(saveFetcher.data);
  if (saveFetcher.data !== seenSave) {
    setSeenSave(saveFetcher.data);
    const sent = saveFetcher.formData?.get("contentJson");
    if (saveFetcher.data?.ok && typeof sent === "string") setLastSaved(sent);
  }
  const assistFetcher = useFetcher<typeof action>();
  const reviewFetcher = useFetcher<typeof action>();
  const reviewJobId =
    reviewFetcher.data?.ok && "jobId" in reviewFetcher.data ? reviewFetcher.data.jobId : null;
  const reviewJob = useAiJob(reviewJobId, reviewFetcher.state !== "idle");

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

  const getCollabToken = useCallback((): Promise<CollabToken> => {
    return new Promise((resolve, reject) => {
      if (!draft) {
        reject(new Error("no working draft"));
        return;
      }
      collabResolvers.current.push({ reject, resolve });
      collabFetcher.submit(
        {
          draftId: draft.id,
          intent: "collab-token",
          templateVersionId: draft.templateVersionId ?? "",
        },
        { method: "post" },
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `collabFetcher` is stable per mount
  }, [draft?.id, draft?.templateVersionId]);

  const getCollabContentJSON = useCallback(() => serializeDocument(contentRef.current), []);

  const [collabNotice, setCollabNotice] = useState<null | string>(null);
  const [collabReadOnly, setCollabReadOnly] = useState(false);
  const [publishedVersion, setPublishedVersion] = useState<null | string>(null);
  const onCollabSnapshotRejected = useCallback((message: string) => {
    setCollabNotice(`Not saved collaboratively: ${message}`);
  }, []);
  const onCollabPublishedElsewhere = useCallback((versionNumber: number) => {
    setCollabReadOnly(true);
    setPublishedVersion(String(versionNumber));
    setCollabNotice(
      "This draft was just published elsewhere. Reload to see the published version.",
    );
  }, []);

  const collabCallbacks = useMemo(
    () => ({
      getContentJSON: getCollabContentJSON,
      getToken: getCollabToken,
      onPublishedElsewhere: onCollabPublishedElsewhere,
      onSnapshotRejected: onCollabSnapshotRejected,
    }),
    [getCollabContentJSON, getCollabToken, onCollabPublishedElsewhere, onCollabSnapshotRejected],
  );
  const collabSession = useCollabSession(draft?.id ?? null, collabCallbacks);
  const { touch: touchCollab } = collabSession;

  // Until the person touches the editor, whatever it reports is the document as loaded: its own
  // form of the stored one, or the room's. That is both the content and what counts as saved, so
  // a draft never opens as "Unsaved changes" (bug log 175), however the editor words the document
  // (table fields, a trailing empty paragraph) and however late the room's content arrives (171).
  const touchedRef = useRef(false);
  const markTouched = useCallback(() => {
    touchedRef.current = true;
  }, []);

  const onDocumentChange = useCallback(
    (next: SerializedDocument) => {
      contentRef.current = next;
      setContent(next);
      if (!touchedRef.current) setLastSaved(serializeDocument(next));
      touchCollab();
    },
    [touchCollab],
  );

  // A result handed back from Generate (U30) or Revise (U31): applied once the editor is up,
  // through it so a live room syncs it, then dropped from the history entry.
  const [editorReady, setEditorReady] = useState(false);
  // The editor is mounted while the room answers, and an empty editor in a room it has not synced
  // reports an empty document. Only a live or solo editor counts as ready.
  useEffect(() => {
    if (collabSession.mode === "pending" || !editorRef.current) return;
    // what the room held while the editor was connecting was not reported; take it now
    if (collabSession.mode === "live" && !touchedRef.current) {
      const reported = editorRef.current.getDocument();
      contentRef.current = reported;
      setContent(reported);
      setLastSaved(serializeDocument(reported));
    }
    setEditorReady(true);
  }, [collabSession.mode]);
  const handedOver = (location.state as { aiApply?: { entries: ChangeEntry[] } } | null)?.aiApply;
  useEffect(() => {
    if (!handedOver || !editorReady) return;
    markTouched();
    const next = applyChangeSet(contentRef.current, outline, handedOver.entries);
    if (editorRef.current) editorRef.current.setDocument(next);
    else onDocumentChange(next);
    void navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per handed-over result
  }, [editorReady, handedOver]);

  // The draft saves itself a moment after the person stops typing (bug log 192). It keys on the
  // content, so the editor wording the document again does not start a save.
  const autosaveContent = serializeDocument(content);
  useAutosave({
    content: autosaveContent,
    delayMs: AUTOSAVE_AFTER_MS,
    enabled: Boolean(draft) && editorReady && !collabReadOnly && !inReview,
    save: () =>
      void saveFetcher.submit(
        {
          contentJson: autosaveContent,
          intent: "save",
          templateVersionId: draft?.templateVersionId ?? "",
        },
        { method: "post" },
      ),
    saved: sameContent(autosaveContent, lastSaved),
    saving: saveFetcher.state !== "idle",
  });

  if (!draft) {
    return (
      <div className="p-6">
        <Banner title="This policy has no working draft." tone="info" />
      </div>
    );
  }

  /** Replace the document: through the editor when it's mounted, so a live room syncs it. */
  const replaceDocument = (next: SerializedDocument) => {
    markTouched();
    if (editorRef.current) {
      editorRef.current.setDocument(next);
      return;
    }
    onDocumentChange(next);
  };

  /** Put the missing or renamed required headings back; all the text stays. */
  const resetRequired = () => replaceDocument(resetRequiredSections(contentRef.current, outline));

  const sectionTexts = aiSections(content, outline);
  const missing = missingRequiredSections(content, outline);
  // a required heading that is missing or renamed can be put back; an empty section cannot
  const resettable = resetRequiredSections(content, outline) !== content;
  const sectionsJson = JSON.stringify(
    sectionTexts.map((s) => ({ sectionKey: s.key, text: s.text, title: s.title })),
  );
  const emptyDraft = sectionTexts.every((section) => section.text.trim() === "");

  const assistAnswer =
    assistFetcher.data?.ok && "suggestion" in assistFetcher.data
      ? assistFetcher.data.suggestion
      : null;
  const assistStage: AiJobStage =
    assistFetcher.state === "idle"
      ? assistFetcher.data && !assistFetcher.data.ok
        ? "failed"
        : "done"
      : "generating";

  const ask = (operation: ReworkChoice, sectionKey: string, text: string, instruction = "") =>
    void assistFetcher.submit(
      {
        editableContent: text,
        instruction,
        intent: "assist",
        operation:
          operation === "clarify"
            ? AssistOperation.AssistOperationClarify
            : AssistOperation.AssistOperationRewrite,
        sectionKey,
        versionId: draft.id,
      },
      { method: "post" },
    );

  const onRework = ({ choice, text }: ReworkRequest) => {
    // The section the selection sits in, for the AI's context; the first one otherwise.
    const holder = sectionTexts.find((section) => section.text.includes(text)) ?? sectionTexts[0];
    setAiNotice(null);
    setSuggestionFor({ kind: "selection", original: text });
    ask(choice, holder?.key ?? "content", text);
  };

  const applySuggestion = () => {
    if (!suggestionFor || assistAnswer === null) return;
    if (suggestionFor.kind === "section") {
      replaceDocument(applyAiText(content, outline, suggestionFor.key, assistAnswer));
    } else if (!editorRef.current?.replaceSelection(assistAnswer)) {
      setAiNotice(tAi("suggestion.stale"));
    }
    setSuggestionFor(null);
  };

  const startReview = () => {
    setReviewOpen(true);
    void reviewFetcher.submit(
      { intent: "review", sectionsJson, versionId: draft.id },
      { method: "post" },
    );
  };
  const findings = reviewJob.stage === "done" ? parseReviewResult(reviewJob.resultJson) : [];
  // A finished review the author hasn't looked at makes the AI menu pulse.
  const reviewReady = reviewJob.stage === "done" && !reviewOpen && reviewSeen !== reviewJobId;
  const aiStatus =
    reviewJob.stage === "queued" ||
    reviewJob.stage === "generating" ||
    assistFetcher.state !== "idle"
      ? "working"
      : reviewReady
        ? "ready"
        : "idle";

  const jumpTo = (sectionKey: string) => {
    setReviewOpen(false);
    const title = sectionTexts.find((section) => section.key === sectionKey)?.title;
    if (!title) return;
    const heading = [
      ...document.querySelectorAll<HTMLElement>("[contenteditable] :is(h1,h2,h3,h4,h5,h6)"),
    ].find((element) => element.textContent?.trim().toLowerCase() === title.trim().toLowerCase());
    heading?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  };

  const firstPublish = !policy.currentPublishedVersionId;
  const outlineRequired = outline.filter((section) => section.required);
  const presenceState: PresenceState = collabReadOnly
    ? "published"
    : collabSession.reconnecting
      ? "reconnecting"
      : collabSession.collaborators.length > 0
        ? "together"
        : "live";
  const serialized = serializeDocument(content);
  const saveState: SaveStateKind =
    saveFetcher.state === "idle"
      ? // the editor reports its own canonical form of what was stored, so compare content
        sameContent(serialized, lastSaved)
        ? "saved"
        : "unsaved"
      : "saving";
  const saveDraftNow = () =>
    void saveFetcher.submit(
      { contentJson: serialized, intent: "save", templateVersionId: draft.templateVersionId ?? "" },
      { method: "post" },
    );

  return (
    <div className="flex flex-col gap-3.5 px-4 pt-[22px] pb-8 text-ink sm:px-8">
      <EditorHeader
        actions={
          <>
            <AiMenu
              available={aiHealth.available && !inReview}
              emptyDraft={emptyDraft}
              onChoose={(choice) => {
                const handOver = { state: { sections: sectionTexts } };
                if (choice === "generate")
                  void navigate(draftPath(policy.number, "generate"), handOver);
                if (choice === "improve")
                  void navigate(draftPath(policy.number, "revise"), handOver);
                if (choice === "rewrite") setRewriteOpen(true);
                if (choice === "review") startReview();
                if (choice === "result") {
                  setReviewSeen(reviewJobId);
                  setReviewOpen(true);
                }
              }}
              reason={aiHealth.reason}
              status={aiStatus}
            />
            <Button
              className="h-[38px] px-3.5"
              disabled={saveFetcher.state !== "idle" || collabReadOnly || inReview}
              onClick={saveDraftNow}
              variant="secondary"
            >
              {t("editor.saveDraft")}
            </Button>
            {inReview ? (
              <StatusPill status="in-review" />
            ) : policy.viewerCan.submit ? (
              <SubmitForApproval
                disabled={collabReadOnly}
                document={{ number: policy.number, title: policy.title }}
                missing={missing}
                published={firstPublish ? undefined : policy.version}
              />
            ) : null}
            <ActionsMenu
              inReview={inReview}
              published={firstPublish ? undefined : policy.version}
            />
          </>
        }
        breadcrumb={
          <RecordBreadcrumb
            page={t("editor.draftWord")}
            published={!firstPublish}
            record={policy}
          />
        }
        meta={[policy.number, firstPublish ? "v1.0.0" : null, t("editor.draftWord")]
          .filter(Boolean)
          .join(" · ")}
        presence={
          collabSession.mode === "live" ? (
            <Presence
              collaborators={collabSession.collaborators}
              publishedVersion={publishedVersion ?? undefined}
              state={presenceState}
            />
          ) : null
        }
        saveState={saveState}
        title={policy.title}
      />

      {inReview ? <p className="text-sm text-muted">{t("editor.review.inReview")}</p> : null}
      {aiNotice ? <Banner title={aiNotice} tone="warn" /> : null}
      {saveFetcher.data && !saveFetcher.data.ok && saveFetcher.data.intent === "save" ? (
        <Banner title={t("editor.autosave.failed")} tone="warn" />
      ) : null}
      {collabNotice ? (
        <Banner title={collabNotice} tone={collabReadOnly ? "info" : "warn"} />
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* The editor adds no padding of its own (bug log 178), so this is the whole margin: 48px.
              `isolate` makes the card its own stacking context: a selected card's controls sit at
              z-index 1000 inside the editor and would otherwise draw over the sticky header (194). */}
          <Card className="isolate px-6 py-8 sm:px-12 sm:py-8">
            <div
              onBeforeInputCapture={markTouched}
              onClickCapture={markTouched}
              onCutCapture={markTouched}
              onDropCapture={markTouched}
              onKeyDownCapture={markTouched}
              onPasteCapture={markTouched}
            >
              <DraftDocumentEditor
                collaboration={collabSession.mode === "solo" ? null : collabSession.collaboration}
                connecting={collabSession.mode === "pending"}
                initialDocument={initialDocument}
                // a room that fell back to solo needs a fresh editor without it; pending to live
                // keeps the same editor, bound to the room before its content arrives
                key={collabSession.mode === "solo" ? "solo" : "room"}
                onChange={
                  collabSession.mode === "pending" ? ignoreWhileConnecting : onDocumentChange
                }
                onReady={(handle) => {
                  editorRef.current = handle;
                  if (collabSession.mode !== "pending") setEditorReady(true);
                }}
                onRework={aiHealth.available && !collabReadOnly && !inReview ? onRework : undefined}
                readOnly={collabReadOnly}
                review={comments}
              />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3.5">
          {outlineRequired.length > 0 ? (
            <RequiredSections
              onReset={resettable ? resetRequired : undefined}
              sections={outlineRequired.map((section) => ({
                filled: !missing.includes(section.title),
                title: section.title,
              }))}
            />
          ) : null}
          <AppendicesPanel
            appendices={draft.appendices.map((appendix) => ({
              id: appendix.id,
              letter: appendix.letter,
              text: (JSON.parse(appendix.contentJson || "{}") as { text?: string }).text ?? "",
              title: appendix.title,
            }))}
            draftId={draft.id}
          />
          <NextVersion
            firstPublish={firstPublish}
            published={firstPublish ? undefined : policy.version}
          />
        </div>
      </div>

      <RewriteSectionDialog
        busy={assistFetcher.state !== "idle"}
        onOpenChange={setRewriteOpen}
        onSuggest={({ choice, instruction, sectionKey }) => {
          const section = sectionTexts.find((candidate) => candidate.key === sectionKey);
          setRewriteOpen(false);
          setSuggestionFor({ key: sectionKey, kind: "section", original: section?.text ?? "" });
          ask(choice, sectionKey, section?.text ?? "", instruction);
        }}
        open={rewriteOpen}
        sections={sectionTexts}
      />
      <SuggestionSheet
        onApply={applySuggestion}
        onOpenChange={(open) => {
          if (!open) setSuggestionFor(null);
        }}
        open={suggestionFor !== null}
        original={suggestionFor?.original ?? ""}
        stage={assistStage}
        suggested={assistAnswer}
      />
      <AiReviewSheet
        error={reviewJob.error}
        findings={findings}
        onJump={jumpTo}
        onOpenChange={(open) => {
          setReviewOpen(open);
          if (open) setReviewSeen(reviewJobId);
        }}
        onRerun={startReview}
        open={reviewOpen}
        sections={sectionTexts}
        stage={reviewJob.stage ?? "queued"}
      />
    </div>
  );
}
