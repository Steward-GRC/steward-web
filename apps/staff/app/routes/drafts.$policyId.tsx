// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { AssistOperation } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Field,
  FindingBadge,
  type FindingSeverity,
  Input,
  Progress,
  Select,
  Textarea,
} from "@steward-web/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { data, Form, Link, useFetcher } from "react-router";

import type { Route } from "./+types/drafts.$policyId";

import {
  authoringAssist,
  getAiHealth,
  submitDraftGeneration,
  submitPolicyReview,
} from "../authoring/ai.server";
import {
  addAppendix,
  deleteAppendix,
  discardDraft,
  getDraftVersion,
  getLatestTemplateVersion,
  getPolicy,
  publishDraft,
  saveDraft,
  updateAppendix,
} from "../authoring/authoring.server";
import { issueCollabToken } from "../authoring/collab/collab.server";
import { type CollabToken, useCollabSession } from "../authoring/collab/useCollabSession";
import {
  type DraftSection,
  ensureTemplateSections,
  missingRequiredSections,
  parseDraftSections,
  scaffoldFromTemplate,
  stringifyDraftSections,
} from "../authoring/sections";
import { useAiHealth } from "../authoring/useAiHealth";

const FREEFORM_SECTION = { key: "content", level: 1, order: 0, required: false, title: "Content" };

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const [policy, aiHealth] = await Promise.all([
    getPolicy(request, params.policyId),
    getAiHealth(request).catch(() => ({ available: false, reason: "ai_service_unavailable" })),
  ]);
  if (!policy?.viewerCan.edit) throw new Response("Not Found", { status: 404 });
  const [draft, templateVersion] = await Promise.all([
    getDraftVersion(request, policy.id),
    policy.templateId ? getLatestTemplateVersion(request, policy.templateId) : null,
  ]);
  return { aiHealth, draft, policy, templateVersion };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const policyId = params.policyId;
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
      case "generate": {
        const sections = JSON.parse(String(form.get("sectionsJson") ?? "[]")) as DraftSection[];
        const { jobId } = await submitDraftGeneration(request, {
          brief: String(form.get("brief") ?? ""),
          sections: sections.map((s, index) => ({
            key: s.sectionKey,
            order: index,
            title: s.title,
          })),
        });
        return data({ intent, jobId, ok: true } as const);
      }
      case "publish": {
        await publishDraft(request, policyId);
        return data({ intent, ok: true } as const);
      }
      case "review": {
        const sections = JSON.parse(String(form.get("sectionsJson") ?? "[]")) as DraftSection[];
        const { jobId } = await submitPolicyReview(request, {
          policyId,
          sections: sections.map((s) => ({ content: s.text, key: s.sectionKey, title: s.title })),
        });
        return data({ intent, jobId, ok: true } as const);
      }
      case "save": {
        const sections = JSON.parse(String(form.get("sectionsJson") ?? "[]")) as DraftSection[];
        const templateVersionId = String(form.get("templateVersionId") ?? "") || null;
        await saveDraft(request, policyId, stringifyDraftSections(sections), templateVersionId);
        return data({ intent, ok: true } as const);
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

interface AiJobPoll {
  error: null | string;
  phase: string;
  resultJson: null | string;
}

/** Polls `resources/ai-jobs/:jobId` every second until the job reaches a terminal phase. */
const useAiJobPoll = (jobId: null | string): AiJobPoll | null => {
  const fetcher = useFetcher<AiJobPoll>();
  const timer = useRef<ReturnType<typeof globalThis.setInterval> | undefined>(undefined);

  useEffect(() => {
    globalThis.clearInterval(timer.current);
    if (!jobId) return;
    void fetcher.load(`/resources/ai-jobs/${jobId}`);
    timer.current = globalThis.setInterval(() => {
      void fetcher.load(`/resources/ai-jobs/${jobId}`);
    }, 1000);
    return () => globalThis.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `fetcher` is stable per mount; `jobId` alone drives the poll
  }, [jobId]);

  useEffect(() => {
    if (
      fetcher.data &&
      fetcher.data.phase !== "AI_JOB_PHASE_PENDING" &&
      fetcher.data.phase !== "AI_JOB_PHASE_RUNNING"
    ) {
      globalThis.clearInterval(timer.current);
    }
  }, [fetcher.data]);

  return fetcher.data ?? null;
};

export default function DraftEditor({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const { t: tAi } = useTranslation("ai");
  const { t: tCommon } = useTranslation("common");
  const { draft, policy, templateVersion } = loaderData;
  const aiHealth = useAiHealth({
    available: loaderData.aiHealth.available,
    reason: loaderData.aiHealth.reason ?? null,
  });

  const outline = templateVersion?.sections ?? (policy.templateNone ? [] : [FREEFORM_SECTION]);

  const [sections, setSections] = useState<DraftSection[]>(() => {
    const parsed = parseDraftSections(draft?.contentJson);
    return outline.length > 0
      ? ensureTemplateSections(parsed, outline)
      : parsed.length > 0
        ? parsed
        : scaffoldFromTemplate([FREEFORM_SECTION]);
  });
  const [assistSectionKey, setAssistSectionKey] = useState<null | string>(null);
  const [appliedGenerateJobId, setAppliedGenerateJobId] = useState<null | string>(null);

  const saveFetcher = useFetcher<typeof action>();
  const publishFetcher = useFetcher<typeof action>();
  const assistFetcher = useFetcher<typeof action>();
  const generateFetcher = useFetcher<typeof action>();
  const reviewFetcher = useFetcher<typeof action>();

  // Derived straight from the submission's own result, not mirrored into separate state: a
  // fetcher already holds its last response for as long as the dialog needs it.
  const generateJobId =
    generateFetcher.data?.ok && "jobId" in generateFetcher.data ? generateFetcher.data.jobId : null;
  const reviewJobId =
    reviewFetcher.data?.ok && "jobId" in reviewFetcher.data ? reviewFetcher.data.jobId : null;

  const generateJob = useAiJobPoll(generateJobId);
  const reviewJob = useAiJobPoll(reviewJobId);

  const collabFetcher = useFetcher<typeof action>();
  const collabResolvers = useRef<
    { reject: (error: unknown) => void; resolve: (token: CollabToken) => void }[]
  >([]);

  useEffect(() => {
    if (collabFetcher.state !== "idle" || !collabFetcher.data) return;
    const resolver = collabResolvers.current.shift();
    if (!resolver) return;
    if (collabFetcher.data.ok && "token" in collabFetcher.data) {
      resolver.resolve({
        expiresAt: collabFetcher.data.expiresAt,
        token: collabFetcher.data.token,
        wsUrl: collabFetcher.data.wsUrl,
      });
    } else {
      resolver.reject(new Error("the collab token request was refused"));
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

  const onRemoteSectionUpdate = useCallback((sectionKey: string, text: string) => {
    setSections((current) =>
      current.map((s) => (s.sectionKey === sectionKey ? { ...s, text } : s)),
    );
  }, []);

  const getCollabContentJSON = useCallback(() => stringifyDraftSections(sections), [sections]);

  const [collabNotice, setCollabNotice] = useState<null | string>(null);
  const [collabReadOnly, setCollabReadOnly] = useState(false);
  const onCollabSnapshotRejected = useCallback((message: string) => {
    setCollabNotice(`Not saved collaboratively: ${message}`);
  }, []);
  const onCollabPublishedElsewhere = useCallback(() => {
    setCollabReadOnly(true);
    setCollabNotice(
      "This draft was just published elsewhere. Reload to see the published version.",
    );
  }, []);

  const collabSession = useCollabSession(
    draft?.id ?? null,
    getCollabToken,
    onRemoteSectionUpdate,
    getCollabContentJSON,
    onCollabSnapshotRejected,
    onCollabPublishedElsewhere,
  );

  if (!draft) {
    return (
      <div className="p-6">
        <Banner title="This policy has no working draft." tone="info" />
      </div>
    );
  }

  const setSectionText = (sectionKey: string, text: string) => {
    setSections((current) =>
      current.map((s) => (s.sectionKey === sectionKey ? { ...s, text } : s)),
    );
    collabSession.sendUpdate(sectionKey, text);
  };

  const missing = missingRequiredSections(sections, outline);
  const sectionsJson = stringifyDraftSections(sections);
  const assistSuggestion =
    assistFetcher.data?.ok && "sectionKey" in assistFetcher.data ? assistFetcher.data : null;

  const generateResult =
    generateJob?.phase === "AI_JOB_PHASE_SUCCEEDED" &&
    generateJob.resultJson &&
    generateJobId !== appliedGenerateJobId
      ? (JSON.parse(generateJob.resultJson) as { sections: { sectionKey: string; text: string }[] })
      : null;
  const reviewResult =
    reviewJob?.phase === "AI_JOB_PHASE_SUCCEEDED" && reviewJob.resultJson
      ? (JSON.parse(reviewJob.resultJson) as {
          findings: {
            finding: string;
            sectionKey: string;
            severity: FindingSeverity;
            suggestion: string;
          }[];
        })
      : null;

  return (
    <div className="grid gap-6 p-6">
      <Link className="text-sm text-muted hover:underline" to="/drafts">
        {t("editor.backToDrafts")}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-ink">{policy.title}</h1>
          {collabSession.presenceCount > 1 ? (
            <span className="rounded-full bg-sunken px-2 py-0.5 text-xs text-muted">
              {t("editor.presence", { count: collabSession.presenceCount })}
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          {aiHealth.available ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">{tAi("generate.title")}</Button>
                </DialogTrigger>
                <DialogContent title={tAi("generate.title")}>
                  <generateFetcher.Form method="post">
                    <input name="intent" type="hidden" value="generate" />
                    <input name="sectionsJson" type="hidden" value={sectionsJson} />
                    <Field label={tAi("generate.brief")}>
                      <Textarea name="brief" required />
                    </Field>
                    <DialogFooter>
                      <Button disabled={generateFetcher.state !== "idle"} type="submit">
                        {tAi("generate.start")}
                      </Button>
                    </DialogFooter>
                  </generateFetcher.Form>
                  {generateJobId && generateJob?.phase !== "AI_JOB_PHASE_SUCCEEDED" ? (
                    <Progress value={generateJob?.phase === "AI_JOB_PHASE_FAILED" ? 100 : 50} />
                  ) : null}
                  {generateResult ? (
                    <div className="grid gap-2">
                      {generateResult.sections.map((generated) => (
                        <div
                          className="rounded-md border border-border p-2 text-sm"
                          key={generated.sectionKey}
                        >
                          {generated.text}
                        </div>
                      ))}
                      <Button
                        onClick={() => {
                          setSections((current) =>
                            current.map((section) => {
                              const generated = generateResult.sections.find(
                                (g) => g.sectionKey === section.sectionKey,
                              );
                              return generated && section.text.trim() === ""
                                ? { ...section, text: generated.text }
                                : section;
                            }),
                          );
                          setAppliedGenerateJobId(generateJobId);
                        }}
                        type="button"
                      >
                        {tAi("assist.apply")}
                      </Button>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">{tAi("review.title")}</Button>
                </DialogTrigger>
                <DialogContent title={tAi("review.title")}>
                  <reviewFetcher.Form method="post">
                    <input name="intent" type="hidden" value="review" />
                    <input name="sectionsJson" type="hidden" value={sectionsJson} />
                    <DialogFooter>
                      <Button disabled={reviewFetcher.state !== "idle"} type="submit">
                        {tAi("review.start")}
                      </Button>
                    </DialogFooter>
                  </reviewFetcher.Form>
                  {reviewJobId && reviewJob?.phase !== "AI_JOB_PHASE_SUCCEEDED" ? (
                    <Progress value={reviewJob?.phase === "AI_JOB_PHASE_FAILED" ? 100 : 50} />
                  ) : null}
                  {reviewResult ? (
                    reviewResult.findings.length === 0 ? (
                      <p className="text-sm text-muted">{tAi("review.empty")}</p>
                    ) : (
                      <ul className="grid gap-2">
                        {reviewResult.findings.map((finding) => (
                          <li
                            className="grid gap-1 rounded-md border border-border p-2"
                            key={finding.sectionKey}
                          >
                            <div className="flex items-center gap-2">
                              <FindingBadge severity={finding.severity} />
                              <span className="text-sm font-medium">{finding.sectionKey}</span>
                            </div>
                            <p className="text-sm text-muted">{finding.finding}</p>
                            {finding.suggestion ? (
                              <p className="text-sm">
                                {tAi("review.suggestion", { suggestion: finding.suggestion })}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )
                  ) : null}
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Banner title={tAi("assist.unavailable")} tone="info" />
          )}

          <publishFetcher.Form method="post">
            <input name="intent" type="hidden" value="publish" />
            <Button
              disabled={publishFetcher.state !== "idle" || missing.length > 0 || collabReadOnly}
              type="submit"
            >
              {t("editor.actions.publish")}
            </Button>
          </publishFetcher.Form>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger">{t("editor.actions.discard")}</Button>
            </DialogTrigger>
            <DialogContent
              description={t("editor.actions.discardConfirm")}
              title={t("editor.actions.discard")}
            >
              <Form method="post">
                <input name="intent" type="hidden" value="discard" />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">{tCommon("actions.cancel")}</Button>
                  </DialogClose>
                  <Button type="submit" variant="danger">
                    {t("editor.actions.discard")}
                  </Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {missing.length > 0 ? (
        <Banner title={t("editor.requiredMissing", { sections: missing.join(", ") })} tone="warn" />
      ) : null}

      {collabNotice ? (
        <Banner title={collabNotice} tone={collabReadOnly ? "info" : "warn"} />
      ) : null}

      <saveFetcher.Form className="grid gap-6" method="post">
        <input name="intent" type="hidden" value="save" />
        <input name="sectionsJson" type="hidden" value={sectionsJson} />
        <input name="templateVersionId" type="hidden" value={draft.templateVersionId ?? ""} />

        {sections.map((section) => (
          <div className="grid gap-2" key={section.sectionKey}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">{section.title}</h2>
              {aiHealth.available ? (
                <Button
                  onClick={() =>
                    setAssistSectionKey(
                      section.sectionKey === assistSectionKey ? null : section.sectionKey,
                    )
                  }
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {tAi("assist.title")}
                </Button>
              ) : null}
            </div>
            <Textarea
              disabled={collabReadOnly}
              onChange={(event) => setSectionText(section.sectionKey, event.target.value)}
              value={section.text}
            />
            {assistSectionKey === section.sectionKey ? (
              <assistFetcher.Form
                className="grid gap-2 rounded-md border border-border p-3"
                method="post"
              >
                <input name="intent" type="hidden" value="assist" />
                <input name="sectionKey" type="hidden" value={section.sectionKey} />
                <input name="editableContent" type="hidden" value={section.text} />
                <Field label={tAi("assist.operationLabel")}>
                  <Select
                    name="operation"
                    options={Object.values(AssistOperation).map((operation) => ({
                      label: tAi(`assist.operation.${operation}`),
                      value: operation,
                    }))}
                  />
                </Field>
                <Field label={tAi("assist.instruction")}>
                  <Input name="instruction" />
                </Field>
                <Button disabled={assistFetcher.state !== "idle"} type="submit">
                  {tAi("assist.ask")}
                </Button>
                {assistSuggestion && assistSuggestion.sectionKey === section.sectionKey ? (
                  <div className="grid gap-2">
                    <p className="text-sm">{assistSuggestion.suggestion}</p>
                    <Button
                      onClick={() => {
                        setSectionText(section.sectionKey, assistSuggestion.suggestion);
                        setAssistSectionKey(null);
                      }}
                      type="button"
                    >
                      {tAi("assist.apply")}
                    </Button>
                  </div>
                ) : null}
              </assistFetcher.Form>
            ) : null}
          </div>
        ))}

        <Button
          className="justify-self-start"
          disabled={saveFetcher.state !== "idle" || collabReadOnly}
          type="submit"
        >
          {tCommon("actions.save")}
        </Button>
      </saveFetcher.Form>

      <div className="grid gap-2">
        <h2 className="text-base font-semibold text-ink">{t("editor.appendices.title")}</h2>
        {draft.appendices.length === 0 ? (
          <p className="text-sm text-muted">{t("editor.appendices.empty")}</p>
        ) : (
          <ul className="grid gap-2">
            {draft.appendices.map((appendix) => {
              const text =
                (JSON.parse(appendix.contentJson || "{}") as { text?: string }).text ?? "";
              return (
                <li className="grid gap-2 rounded-md border border-border p-3" key={appendix.id}>
                  <Form className="grid gap-2" method="post">
                    <input name="intent" type="hidden" value="update-appendix" />
                    <input name="appendixId" type="hidden" value={appendix.id} />
                    <Input defaultValue={appendix.title} name="title" />
                    <Textarea defaultValue={text} name="text" />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" type="submit">
                        {tCommon("actions.save")}
                      </Button>
                    </div>
                  </Form>
                  <Form method="post">
                    <input name="intent" type="hidden" value="delete-appendix" />
                    <input name="appendixId" type="hidden" value={appendix.id} />
                    <Button size="sm" type="submit" variant="ghost">
                      {tCommon("actions.delete")}
                    </Button>
                  </Form>
                </li>
              );
            })}
          </ul>
        )}
        <Form method="post">
          <input name="intent" type="hidden" value="add-appendix" />
          <input name="policyVersionId" type="hidden" value={draft.id} />
          <Button size="sm" type="submit" variant="secondary">
            {t("editor.appendices.add")}
          </Button>
        </Form>
      </div>
    </div>
  );
}
