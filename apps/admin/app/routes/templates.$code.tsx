// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SectionInput } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Banner,
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  EmptyState,
  type Failure,
  Field,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  NotFound,
} from "@steward-web/ui";
import { Check, MoreHorizontal } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/templates.$code";

import { sectionChanges } from "../templates/sectionChanges";
import { outlineOf, SectionOutlineEditor } from "../templates/SectionOutlineEditor";
import {
  createTemplateVersion,
  deleteTemplate,
  discardTemplateVersion,
  findTemplateByCode,
  listTemplateVersions,
  publishTemplateVersion,
  renameTemplate,
  retireTemplate,
  updateTemplateVersionSections,
} from "../templates/templates.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const template = await findTemplateByCode(request, params.code);
  if (!template) return data({ template: null, versions: [] }, { status: 404 });
  const versions = await listTemplateVersions(request, template.id);
  return { template, versions };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const template = await findTemplateByCode(request, params.code);
  if (!template) throw new Response("Not Found", { status: 404 });
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "create-version": {
        const versions = await listTemplateVersions(request, template.id);
        const base = versions.find((v) => v.status === "published")?.sections ?? [];
        await createTemplateVersion(request, template.id, base);
        return data({ intent, ok: true } as const);
      }
      case "delete": {
        await deleteTemplate(request, template.id);
        return redirect("/templates");
      }
      case "discard-draft": {
        await discardTemplateVersion(request, String(form.get("versionId") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "publish": {
        await publishTemplateVersion(request, String(form.get("versionId") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "rename": {
        const name = String(form.get("name") ?? "").trim();
        if (!name) {
          return data({ intent, ok: false, validationError: "A name is required." } as const, {
            status: 400,
          });
        }
        await renameTemplate(request, template.id, name);
        return data({ intent, ok: true } as const);
      }
      case "retire": {
        await retireTemplate(request, template.id);
        return redirect("/templates");
      }
      case "save-sections": {
        const sections = JSON.parse(
          String(form.get("sectionsJson") ?? "[]"),
        ) as readonly SectionInput[];
        await updateTemplateVersionSections(request, String(form.get("versionId") ?? ""), sections);
        return data({ intent, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

type Result =
  | { failure: Failure; intent: string; ok: false }
  | { intent: string; ok: false; validationError: string }
  | { intent: string; ok: true };

const failureOf = (fetcher: { data?: Result; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "failure" in fetcher.data
    ? fetcher.data.failure
    : undefined;

const STEPS = ["sections", "review", "publish"] as const;
type Step = (typeof STEPS)[number];

/** A7's three steps: the step showing is plum, a passed one green with a check. */
const DraftSteps = ({ onSelect, step }: { onSelect: (step: Step) => void; step: Step }) => {
  const { t } = useTranslation("admin");
  const at = STEPS.indexOf(step);
  return (
    <ol
      aria-label={t("templates.detail.steps.label")}
      className="grid grid-cols-3 gap-1.5 text-sm font-semibold"
    >
      {STEPS.map((entry, index) => (
        <li key={entry}>
          <button
            aria-current={entry === step ? "step" : undefined}
            className={cn(
              "flex w-full items-center gap-1.5 rounded-md px-2.5 py-[9px] text-left disabled:cursor-not-allowed",
              entry === step
                ? "bg-primary text-on-primary"
                : index < at
                  ? "bg-ok-soft text-ok"
                  : "bg-surface text-muted shadow-[inset_0_0_0_1px_var(--border)]",
            )}
            disabled={index > at}
            onClick={() => onSelect(entry)}
            type="button"
          >
            {index < at ? <Check aria-hidden="true" className="size-4" /> : null}
            {`${index + 1} ${t(`templates.detail.steps.${entry}`)}`}
          </button>
        </li>
      ))}
    </ol>
  );
};

/** A confirm dialog that posts one intent: D30's discard, retire and delete. */
const ConfirmDialog = ({
  confirm,
  description,
  extra = {},
  intent,
  onOpenChange,
  open,
  title,
}: {
  confirm: string;
  description: string;
  extra?: Record<string, string>;
  intent: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}) => {
  const { t } = useTranslation("admin");
  const fetcher = useFetcher<Result>();
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        busy={fetcher.state !== "idle"}
        description={description}
        title={title}
        tone="danger"
      >
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("templates.detail.dialogs.cancel")}</Button>
          </DialogClose>
          <Button
            busy={fetcher.state !== "idle"}
            onClick={() => {
              void fetcher.submit({ intent, ...extra }, { method: "post" });
              onOpenChange(false);
            }}
            variant="danger"
          >
            {confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Template detail (A7): the name with its active and draft versions, then the draft wizard,
 * Sections, Review (what changes against the published version) and Publish, and the version
 * history. Rename, Retire and Delete sit in the actions menu.
 */
export default function TemplateDetail({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { template, versions } = loaderData;
  const draft = versions.find((v) => v.status === "draft");
  const active = versions.find((v) => v.status === "published");
  const [sections, setSections] = useState<readonly SectionInput[]>(() =>
    outlineOf(draft?.sections ?? []),
  );
  const [step, setStep] = useState<Step>("sections");
  // A new or discarded draft starts the wizard again from its own sections.
  const [draftId, setDraftId] = useState(draft?.id);
  if (draft?.id !== draftId) {
    setDraftId(draft?.id);
    setSections(outlineOf(draft?.sections ?? []));
    setStep("sections");
  }
  const [dialog, setDialog] = useState<"delete" | "discard" | "rename" | "retire" | null>(null);
  const save = useFetcher<Result>();
  const publish = useFetcher<Result>();
  const create = useFetcher<Result>();
  const rename = useFetcher<Result>();
  const historyId = useId();

  // A saved draft moves on to Review.
  const saved = save.state === "idle" && save.data?.ok;
  useEffect(() => {
    if (saved) setStep("review");
  }, [saved, save.data]);

  if (!template) {
    return (
      <div className="flex w-full flex-col p-4 md:p-6">
        <NotFound
          action={
            <Button asChild variant="secondary">
              <Link to="/templates">{t("templates.detail.notFound.action")}</Link>
            </Button>
          }
          description={t("templates.detail.notFound.description")}
          title={t("templates.detail.notFound.title")}
        />
      </div>
    );
  }

  const versionLine =
    active && draft
      ? t("templates.detail.versions", { active: active.versionNo, draft: draft.versionNo })
      : active
        ? t("templates.detail.activeOnly", { active: active.versionNo })
        : draft
          ? t("templates.detail.draftOnly", { draft: draft.versionNo })
          : t("templates.detail.noVersions");
  const changes = sectionChanges(active?.sections ?? [], sections);
  const failure = [save, publish, create, rename]
    .map((fetcher) => failureOf(fetcher))
    .find(Boolean);
  const statusLabel = (status: string) => t(`templates.status.${status}`, { defaultValue: status });

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{t("templates.detail.eyebrow")}</p>
          <h1 className="text-[26px] leading-[1.3] font-semibold">{template.name}</h1>
          <p className="font-mono text-sm text-muted">{versionLine}</p>
        </div>
        {draft ? (
          <Button
            className="h-[34px] px-3"
            onClick={() => setDialog("discard")}
            variant="secondary"
          >
            {t("templates.detail.discard")}
          </Button>
        ) : (
          <Button
            busy={create.state !== "idle"}
            onClick={() => void create.submit({ intent: "create-version" }, { method: "post" })}
          >
            {t("templates.detail.createVersion")}
          </Button>
        )}
        <Menu>
          <MenuTrigger asChild>
            <Button aria-label={t("templates.detail.more")} size="icon" variant="secondary">
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem onSelect={() => setDialog("rename")}>{t("templates.detail.rename")}</MenuItem>
            <MenuItem onSelect={() => setDialog("retire")}>{t("templates.detail.retire")}</MenuItem>
            <MenuItem onSelect={() => setDialog("delete")}>{t("templates.detail.delete")}</MenuItem>
          </MenuContent>
        </Menu>
      </header>

      {failure ? (
        <Banner failure={failure} title={t("templates.detail.failed")} tone="danger" />
      ) : null}

      {draft ? (
        <>
          <DraftSteps onSelect={setStep} step={step} />
          {step === "sections" ? (
            <>
              <SectionOutlineEditor onChange={setSections} sections={sections} />
              <div className="flex justify-end">
                <Button
                  busy={save.state !== "idle"}
                  className="h-[38px] px-4 text-base"
                  onClick={() =>
                    void save.submit(
                      {
                        intent: "save-sections",
                        sectionsJson: JSON.stringify(sections),
                        versionId: draft.id,
                      },
                      { method: "post" },
                    )
                  }
                >
                  {t("templates.detail.next")}
                </Button>
              </div>
            </>
          ) : null}
          {step === "review" ? (
            <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-4">
              <b>
                {active
                  ? t("templates.detail.review.title", { version: active.versionNo })
                  : t("templates.detail.review.titleFirst")}
              </b>
              {changes.length === 0 ? (
                <p className="text-sm text-muted">{t("templates.detail.review.none")}</p>
              ) : (
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                  {changes.map((change, index) => (
                    <li key={index}>{t(`templates.detail.review.${change.kind}`, change)}</li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setStep("sections")} variant="secondary">
                  {t("templates.detail.back")}
                </Button>
                <Button className="h-[38px] px-4 text-base" onClick={() => setStep("publish")}>
                  {t("templates.detail.nextPublish")}
                </Button>
              </div>
            </section>
          ) : null}
          {step === "publish" ? (
            <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-4">
              <b>{t("templates.detail.publish.title", { version: draft.versionNo })}</b>
              <p className="text-sm text-muted">{t("templates.detail.publish.description")}</p>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setStep("review")} variant="secondary">
                  {t("templates.detail.back")}
                </Button>
                <Button
                  busy={publish.state !== "idle"}
                  className="h-[38px] px-4 text-base"
                  onClick={() =>
                    void publish.submit(
                      { intent: "publish", versionId: draft.id },
                      { method: "post" },
                    )
                  }
                >
                  {t("templates.detail.publish.action")}
                </Button>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <EmptyState
          description={t("templates.detail.noDraft.description")}
          title={t("templates.detail.noDraft.title")}
        />
      )}

      <section aria-labelledby={historyId} className="flex flex-col gap-2">
        <h2 className="font-semibold" id={historyId}>
          {t("templates.detail.history")}
        </h2>
        <ol aria-labelledby={historyId} className="flex flex-col border-l-2 border-border pl-4">
          {versions.map((version) => (
            <li className="relative flex items-center gap-2 py-1.5 text-sm" key={version.id}>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[21px] size-2.5 rounded-full",
                  version.status === "published"
                    ? "bg-ok"
                    : version.status === "draft"
                      ? "bg-primary"
                      : "bg-border-strong",
                )}
              />
              <span className="font-mono">
                {t("templates.detail.historyItem", {
                  count: version.sections.length,
                  version: version.versionNo,
                })}
              </span>
              <span className="text-muted">{statusLabel(version.status)}</span>
            </li>
          ))}
        </ol>
      </section>

      <ConfirmDialog
        confirm={t("templates.detail.dialogs.discardConfirm")}
        description={t("templates.detail.dialogs.discardDescription")}
        extra={{ versionId: draft?.id ?? "" }}
        intent="discard-draft"
        onOpenChange={(next) => setDialog(next ? "discard" : null)}
        open={dialog === "discard"}
        title={t("templates.detail.dialogs.discardTitle", { version: draft?.versionNo ?? "" })}
      />
      <ConfirmDialog
        confirm={t("templates.detail.dialogs.retireConfirm")}
        description={t("templates.detail.dialogs.retireDescription")}
        intent="retire"
        onOpenChange={(next) => setDialog(next ? "retire" : null)}
        open={dialog === "retire"}
        title={t("templates.detail.dialogs.retireTitle", { name: template.name })}
      />
      <ConfirmDialog
        confirm={t("templates.detail.dialogs.deleteConfirm")}
        description={t("templates.detail.dialogs.deleteDescription")}
        intent="delete"
        onOpenChange={(next) => setDialog(next ? "delete" : null)}
        open={dialog === "delete"}
        title={t("templates.detail.dialogs.deleteTitle", { name: template.name })}
      />
      <Dialog onOpenChange={(next) => setDialog(next ? "rename" : null)} open={dialog === "rename"}>
        <DialogContent
          hasInput
          title={t("templates.detail.dialogs.renameTitle", { name: template.name })}
        >
          <rename.Form method="post" onSubmit={() => setDialog(null)}>
            <input name="intent" type="hidden" value="rename" />
            <DialogBody>
              <Field label={t("templates.detail.dialogs.renameLabel")}>
                <Input defaultValue={template.name} name="name" required />
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("templates.detail.dialogs.cancel")}</Button>
              </DialogClose>
              <Button type="submit">{t("templates.detail.dialogs.renameConfirm")}</Button>
            </DialogFooter>
          </rename.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
