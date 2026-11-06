// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Generate with AI (Authoring U30, Flow 7): sources and a brief, the output format, then a
// first draft to refine turn by turn in a chat beside a live preview, and Apply draft to put it
// in the editor. The Framing step (U30.2) waits for steward-gateway#63; until then there are
// three steps.
import { AssistOperation } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest, requireRoleFromRequest } from "@steward-web/auth/server";
import { formatNumber, useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Card, cn, Input, Spinner, Textarea } from "@steward-web/ui";
import { draftPath } from "@steward-web/ui/domain";
import { FileText, Link2, Lock, LockOpen, Send, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";
import { data, useFetcher, useLocation, useNavigate } from "react-router";

import type { Route } from "./+types/drafts.$number.generate";

import {
  authoringAssist,
  submitDraftGeneration,
  submitPolicyReview,
  submitPolicyRevision,
} from "../authoring/ai.server";
import { aiOffReason } from "../authoring/ai/aiOff";
import { loadDraftForAi } from "../authoring/ai/aiPage.server";
import { ChangeCard } from "../authoring/ai/ChangeCard";
import {
  type ChangeEntry,
  parseDraftResult,
  parseReviewResult,
  parseRevisionResult,
} from "../authoring/ai/results";
import { useAiJob } from "../authoring/ai/useAiJob";
import { policyIdOfNumber } from "../authoring/authoring.server";
import { type SectionText } from "../authoring/sections";
import { useAiHealth } from "../authoring/useAiHealth";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requireRoleFromRequest(request, PERMISSIONS.PolicyAuthor, "author");
  return loadDraftForAi(request, params.number);
};

const sectionsOf = (form: FormData): SectionText[] =>
  JSON.parse(String(form.get("sectionsJson") ?? "[]")) as SectionText[];

export const action = async ({ params, request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const form = await request.formData();
  const intent = form.get("intent");
  const policyId = await policyIdOfNumber(request, params.number);
  const versionId = String(form.get("versionId") ?? "");
  try {
    switch (intent) {
      case "draft": {
        const { jobId } = await submitDraftGeneration(request, {
          brief: String(form.get("brief") ?? ""),
          homeGroupId: String(form.get("homeGroupId") ?? "") || null,
          referenceDocuments: JSON.parse(String(form.get("documentsJson") ?? "[]")) as {
            content: string;
            title: string;
          }[],
          referenceHints: JSON.parse(String(form.get("hintsJson") ?? "[]")) as string[],
          sections: sectionsOf(form).map((section, order) => ({
            key: section.key,
            order,
            title: section.title,
          })),
          title: String(form.get("title") ?? "") || null,
        });
        return data({ intent, jobId, ok: true as const });
      }
      case "review": {
        const { jobId } = await submitPolicyReview(request, {
          policyId,
          sections: sectionsOf(form).map((s) => ({ content: s.text, key: s.key, title: s.title })),
          versionId,
        });
        return data({ intent, jobId, ok: true as const });
      }
      case "revise": {
        const { jobId } = await submitPolicyRevision(request, {
          instruction: String(form.get("instruction") ?? ""),
          policyId,
          sections: sectionsOf(form).map((s, order) => ({
            content: s.text,
            key: s.key,
            order,
            title: s.title,
          })),
          versionId,
        });
        return data({ intent, jobId, ok: true as const });
      }
      case "summarize": {
        const sections = sectionsOf(form);
        const result = await authoringAssist(request, {
          editableContent: sections.map((s) => `${s.title}\n${s.text}`).join("\n\n"),
          operation: AssistOperation.AssistOperationSummarize,
          policyId,
          sectionKey: sections[0]?.key ?? "content",
          versionId,
        });
        return data({ intent, ok: true as const, summary: result.suggestion });
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

type Mode = "draft" | "improve" | "review" | "rewrite" | "summarize";
const MODES: Mode[] = ["draft", "improve", "rewrite", "review", "summarize"];

interface Conflict {
  key: string;
  text: string;
  title: string;
}

interface PreviewSection {
  /** The text before the latest turn, for its diff. */
  before: string;
  key: string;
  locked: boolean;
  /** Not in the template: a section a turn added, and the one it follows. */
  newAfter?: string;
  status: "changed" | "new" | "unchanged";
  text: string;
  title: string;
}

interface Reference {
  label: string;
  state: "checking" | "invalid" | "readable" | "unreadable";
}

interface Turn {
  role: "ai" | "author";
  text: string;
}

const STEPS = ["sources", "format", "refine"] as const;

const FINDING_LABEL = { blocker: "blocker", info: "note", warn: "warning" } as const;

export default function Generate({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("ai");
  const { t: tAuthoring } = useTranslation("authoring");
  const ids = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const { draftId, outline, policy } = loaderData;
  const aiHealth = useAiHealth(loaderData.aiHealth);
  const handed = (location.state as { sections?: SectionText[] } | null)?.sections;
  const original = handed ?? loaderData.sections;

  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState("");
  const [briefTried, setBriefTried] = useState(false);
  const [notes, setNotes] = useState("");
  const [document, setDocument] = useState<{ content: string; title: string } | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [urls, setUrls] = useState<Record<string, Reference>>({});
  const [leftOut, setLeftOut] = useState<ReadonlySet<string>>(new Set());

  const [preview, setPreview] = useState<PreviewSection[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [mode, setMode] = useState<Mode>("draft");
  const [ask, setAsk] = useState("");

  const extract = useFetcher<{
    characters?: number;
    content?: string;
    ok: boolean;
    reason?: null | string;
    title?: string;
  }>();
  const check = useFetcher<{ malformed?: boolean; ok: boolean; readable?: boolean; url: string }>();
  const ai = useFetcher<typeof action>();
  const jobId = ai.data?.ok && "jobId" in ai.data ? ai.data.jobId : null;
  const job = useAiJob(jobId, ai.state !== "idle");

  const included = outline.length > 0 ? original.filter((s) => !leftOut.has(s.key)) : original;

  // The reference document and URL checks, as each answer arrives.
  const [seenExtract, setSeenExtract] = useState(extract.data);
  if (extract.data !== seenExtract) {
    setSeenExtract(extract.data);
    setDocument(
      extract.data?.ok
        ? { content: extract.data.content ?? "", title: extract.data.title ?? "" }
        : null,
    );
  }
  const [seenCheck, setSeenCheck] = useState(check.data);
  if (check.data !== seenCheck) {
    setSeenCheck(check.data);
    if (check.data) {
      const answer = check.data;
      setUrls((current) => ({
        ...current,
        [answer.url]: {
          label: answer.url,
          state: answer.malformed ? "invalid" : answer.readable ? "readable" : "unreadable",
        },
      }));
    }
  }

  // Each AI turn's result, once, as it lands.
  const [handledJob, setHandledJob] = useState<null | string>(null);
  const [handledSummary, setHandledSummary] = useState(ai.data);
  if (ai.data !== handledSummary) {
    setHandledSummary(ai.data);
    const answer = ai.data;
    if (answer?.ok && "summary" in answer) {
      setTurns((current) => [...current, { role: "ai", text: answer.summary }]);
    }
  }
  if (jobId && job.stage === "done" && handledJob !== jobId) {
    setHandledJob(jobId);
    const intent = ai.data?.intent;
    switch (intent) {
      case "draft": {
        const drafted = parseDraftResult(job.resultJson);
        setPreview((current) =>
          (current.length > 0 ? current : included.map((s) => toPreview(s))).map((section) => {
            const text = drafted.find((d) => d.sectionKey === section.key)?.text;
            if (section.locked || text === undefined)
              return { ...section, before: section.text, status: "unchanged" };
            return { ...section, before: section.text, status: "changed", text };
          }),
        );
        setTurns((current) => [
          ...current,
          { role: "ai", text: t("generate.turn.drafted", { count: drafted.length }) },
        ]);
        setStep(2);
        setMode("improve");

        break;
      }
      case "review": {
        const findings = parseReviewResult(job.resultJson);
        setTurns((current) => [
          ...current,
          {
            role: "ai",
            text:
              findings.length === 0
                ? t("reviewSheet.none")
                : findings
                    .map((f) => `${t(`finding.${FINDING_LABEL[f.severity]}`)} · ${f.finding}`)
                    .join("\n"),
          },
        ]);

        break;
      }
      case "revise": {
        const revision = parseRevisionResult(job.resultJson);
        const touched: string[] = [];
        const locked: Conflict[] = [];
        setPreview((current) => {
          const next = current.map((section): PreviewSection => {
            const revised = revision.sections.find((r) => r.sectionKey === section.key);
            const text = revised?.removed ? "" : revised?.changed ? revised.content : undefined;
            if (text === undefined || text === section.text) {
              return { ...section, before: section.text, status: "unchanged" };
            }
            if (section.locked) {
              locked.push({ key: section.key, text, title: section.title });
              return { ...section, before: section.text, status: "unchanged" };
            }
            touched.push(section.title);
            return { ...section, before: section.text, status: "changed", text };
          });
          for (const [index, added] of revision.newSections.entries()) {
            touched.push(added.title);
            const at = next.findIndex((section) => section.key === added.afterKey);
            const row: PreviewSection = {
              before: "",
              key: `new-${jobId}-${index}`,
              locked: false,
              newAfter: added.afterKey,
              status: "new",
              text: added.content,
              title: added.title,
            };
            if (at === -1) next.push(row);
            else next.splice(at + 1, 0, row);
          }
          return next;
        });
        setConflicts(locked);
        setTurns((current) => [
          ...current,
          {
            role: "ai",
            text:
              touched.length > 0
                ? t("generate.turn.updated", { sections: touched.join(", ") })
                : t("generate.turn.unchanged"),
          },
        ]);

        break;
      }
      // No default
    }
  }

  const sectionsForAi = (): SectionText[] =>
    (preview.length > 0 ? preview : original).map((s) => ({
      key: s.key,
      text: s.text,
      title: s.title,
    }));

  const startDraft = (extra?: string) =>
    void ai.submit(
      {
        brief: extra ? `${brief}\n\n${extra}` : brief,
        documentsJson: JSON.stringify(document ? [document] : []),
        hintsJson: JSON.stringify([
          ...Object.values(urls)
            .filter((u) => u.state === "readable")
            .map((u) => u.label),
          ...(notes.trim() ? [notes.trim()] : []),
        ]),
        homeGroupId: policy.homeGroupId ?? "",
        intent: "draft",
        sectionsJson: JSON.stringify(included),
        title: policy.title,
        versionId: draftId,
      },
      { method: "post" },
    );

  const send = () => {
    const instruction = ask.trim();
    if (!instruction && mode !== "review" && mode !== "summarize") return;
    if (instruction) setTurns((current) => [...current, { role: "author", text: instruction }]);
    setAsk("");
    setConflicts([]);
    if (mode === "draft") {
      startDraft(instruction);
      return;
    }
    const intent = mode === "improve" || mode === "rewrite" ? "revise" : mode;
    void ai.submit(
      {
        instruction:
          mode === "rewrite" ? `${t("generate.rewritePrefix")} ${instruction}` : instruction,
        intent,
        sectionsJson: JSON.stringify(sectionsForAi()),
        versionId: draftId,
      },
      { method: "post" },
    );
  };

  const resolve = (conflict: Conflict, update: boolean) => {
    setConflicts((current) => current.filter((c) => c.key !== conflict.key));
    if (!update) return;
    setPreview((current) =>
      current.map((section) =>
        section.key === conflict.key
          ? {
              ...section,
              before: section.text,
              locked: false,
              status: "changed",
              text: conflict.text,
            }
          : section,
      ),
    );
  };

  const apply = () => {
    const entries: ChangeEntry[] = preview.flatMap((section): ChangeEntry[] => {
      const was = original.find((s) => s.key === section.key);
      if (!was) {
        return [
          {
            after: section.text,
            afterKey: section.newAfter,
            before: "",
            key: section.key,
            kind: "new",
            title: section.title,
          },
        ];
      }
      if (was.text === section.text) {
        return [
          {
            after: section.text,
            before: was.text,
            key: section.key,
            kind: "unchanged",
            title: section.title,
          },
        ];
      }
      return [
        {
          after: section.text,
          before: was.text,
          key: section.key,
          kind: "changed",
          title: section.title,
        },
      ];
    });
    void navigate(draftPath(policy.number), { state: { aiApply: { entries } } });
  };

  const working = job.stage === "queued" || job.stage === "generating";
  const refused = ai.data && !ai.data.ok ? ai.data.error : null;
  const next = () => {
    setBriefTried(true);
    if (brief.trim()) setStep(1);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-8 text-ink sm:px-8">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t("generate.eyebrow")}</span>
          <h1 className="text-[28px] font-semibold">
            {t("generate.pageTitle", { title: policy.title })}
          </h1>
        </div>
        <Button
          className="h-[38px] px-4"
          disabled={preview.length === 0 || working}
          onClick={apply}
        >
          {t("generate.apply")}
        </Button>
      </div>

      <ol
        aria-label={t("generate.steps")}
        className="grid grid-cols-3 gap-1.5 text-[13px] font-semibold"
      >
        {STEPS.map((name, index) => (
          <li
            aria-current={index === step ? "step" : undefined}
            className={cn(
              "rounded-md px-3 py-2.5",
              index < step && "bg-ok-soft text-ok",
              index === step && "bg-primary text-on-primary",
              index > step && "bg-sunken text-muted",
            )}
            key={name}
          >
            {`${index + 1} ${t(`generate.step.${name}`)}`}
          </li>
        ))}
      </ol>

      {aiHealth.available ? null : (
        <Banner title={tAuthoring(aiOffReason(aiHealth.reason))} tone="warn" />
      )}
      {refused ? <Banner title={t("refused")} tone="danger" /> : null}

      {step === 0 ? (
        <Card className="flex flex-col gap-3 p-4">
          <h2 className="font-bold">{t("generate.step.sources")}</h2>
          <div className="flex flex-col gap-[5px]">
            <label className="text-sm font-medium" htmlFor={`${ids}-brief`}>
              {t("generate.brief")}
            </label>
            <Textarea
              aria-invalid={briefTried && !brief.trim() ? true : undefined}
              className="min-h-14"
              id={`${ids}-brief`}
              onChange={(event) => setBrief(event.target.value)}
              placeholder={t("generate.briefHint")}
              required
              value={brief}
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-sm font-medium" htmlFor={`${ids}-document`}>
              {t("generate.document")}
            </label>
            <input
              accept=".pdf,.doc,.docx,.rtf,.md,.txt"
              className="text-sm"
              id={`${ids}-document`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const form = new FormData();
                form.set("file", file);
                void extract.submit(form, {
                  action: "/resources/documents/extract",
                  encType: "multipart/form-data",
                  method: "post",
                });
              }}
              type="file"
            />
            {extract.state === "idle" ? (
              extract.data ? (
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px]",
                    extract.data.ok ? "bg-sunken" : "bg-danger-soft text-danger",
                  )}
                >
                  <FileText aria-hidden="true" className="size-4" />
                  {extract.data.ok ? (
                    <>
                      {extract.data.title}
                      <span className="ml-auto text-ok">
                        {t("generate.read", {
                          count: extract.data.characters ?? 0,
                          formatted: formatNumber(extract.data.characters ?? 0),
                        })}
                      </span>
                    </>
                  ) : (
                    (extract.data.reason ?? t("generate.unreadable"))
                  )}
                </span>
              ) : null
            ) : (
              <span className="text-[13px] text-muted">{t("generate.reading")}</span>
            )}
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-sm font-medium" htmlFor={`${ids}-url`}>
              {t("generate.url")}
            </label>
            <div className="flex gap-2">
              <Input
                id={`${ids}-url`}
                onChange={(event) => setUrlDraft(event.target.value)}
                placeholder="https://"
                value={urlDraft}
              />
              <Button
                disabled={!urlDraft.trim() || check.state !== "idle"}
                onClick={() => {
                  const url = urlDraft.trim();
                  setUrls((current) => ({ ...current, [url]: { label: url, state: "checking" } }));
                  setUrlDraft("");
                  void check.submit(
                    { url },
                    { action: "/resources/documents/validate-url", method: "post" },
                  );
                }}
                variant="secondary"
              >
                {t("generate.addUrl")}
              </Button>
            </div>
            {Object.values(urls).map((reference) => (
              <span
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px]",
                  reference.state === "readable" || reference.state === "checking"
                    ? "bg-sunken"
                    : "bg-danger-soft text-danger",
                )}
                key={reference.label}
              >
                <Link2 aria-hidden="true" className="size-4" />
                <span className="truncate">{reference.label}</span>
                <span className="ml-auto font-semibold">
                  {t(`generate.urlState.${reference.state}`)}
                </span>
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-sm font-medium" htmlFor={`${ids}-notes`}>
              {t("generate.notes")}
            </label>
            <Textarea
              id={`${ids}-notes`}
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={next}>{t("generate.next")}</Button>
          </div>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card aria-labelledby={`${ids}-format`} className="flex flex-col gap-2 p-4">
          <h2 className="font-bold" id={`${ids}-format`}>
            {t("generate.step.format")}
          </h2>
          {outline.length === 0 ? (
            <div className="flex flex-col gap-1 text-sm">
              <b>{t("generate.noTemplate")}</b>
              <span className="text-muted">{t("generate.freeform")}</span>
            </div>
          ) : (
            outline.map((section) =>
              section.required ? (
                <span
                  className="flex justify-between rounded-md bg-sunken px-2.5 py-2"
                  key={section.key}
                >
                  {section.title}
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Lock aria-hidden="true" className="size-3" />
                    {t("generate.required")}
                  </span>
                </span>
              ) : (
                <label
                  className="flex items-center justify-between rounded-md px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--color-border)]"
                  key={section.key}
                >
                  {section.title}
                  <input
                    aria-checked={!leftOut.has(section.key)}
                    checked={!leftOut.has(section.key)}
                    className="h-5 w-[34px] cursor-pointer appearance-none rounded-full bg-border-strong transition-colors before:block before:size-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-surface before:transition-transform checked:bg-primary checked:before:translate-x-4"
                    onChange={(event) =>
                      setLeftOut((current) => {
                        const next = new Set(current);
                        if (event.target.checked) next.delete(section.key);
                        else next.add(section.key);
                        return next;
                      })
                    }
                    role="switch"
                    type="checkbox"
                  />
                </label>
              ),
            )
          )}
          <div className="flex justify-between">
            <Button onClick={() => setStep(0)} variant="secondary">
              {t("generate.back")}
            </Button>
            <Button disabled={!aiHealth.available || working} onClick={() => startDraft()}>
              {t("generate.start")}
            </Button>
          </div>
          {working ? <Drafting /> : null}
        </Card>
      ) : null}

      {step === 2 ? (
        <div className="grid items-stretch gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
          <Card className="flex min-h-[500px] flex-col">
            <div className="flex flex-col gap-2 border-b border-border px-3.5 py-3">
              <span className="text-[13px] font-semibold" id={`${ids}-mode`}>
                {t("generate.mode")}
              </span>
              <div
                aria-labelledby={`${ids}-mode`}
                className="flex flex-wrap gap-1"
                role="radiogroup"
              >
                {MODES.map((value) => (
                  <label
                    className={cn(
                      "flex h-[30px] cursor-pointer items-center rounded-full px-2.5 text-xs font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                      mode === value
                        ? "bg-primary text-on-primary"
                        : "bg-surface shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
                    )}
                    key={value}
                  >
                    <input
                      checked={mode === value}
                      className="sr-only"
                      name={`${ids}-mode`}
                      onChange={() => setMode(value)}
                      type="radio"
                    />
                    {t(`generate.modes.${value}`)}
                  </label>
                ))}
              </div>
            </div>
            <div aria-live="polite" className="flex flex-1 flex-col gap-3 p-3.5 leading-[1.5]">
              {turns.map((turn, index) => (
                <p
                  className={cn(
                    "px-3 py-2.5 whitespace-pre-line",
                    turn.role === "author"
                      ? "max-w-[80%] self-end rounded-[12px_12px_2px_12px] bg-primary-soft text-on-primary-soft"
                      : "max-w-[88%] self-start rounded-[12px_12px_12px_2px] bg-sunken",
                  )}
                  key={index}
                >
                  {turn.text}
                </p>
              ))}
              {conflicts.map((conflict) => (
                <div
                  aria-label={t("generate.conflict", { title: conflict.title })}
                  className="flex flex-col gap-1.5 rounded-lg bg-warn-soft px-3 py-2.5 text-warn shadow-[inset_0_0_0_1px_var(--color-warn)]"
                  key={conflict.key}
                  role="group"
                >
                  <b>{t("generate.conflict", { title: conflict.title })}</b>
                  <span className="flex gap-3.5">
                    <Button
                      className="h-auto p-0 font-semibold text-warn"
                      onClick={() => resolve(conflict, true)}
                      variant="link"
                    >
                      {t("generate.unlockUpdate")}
                    </Button>
                    <Button
                      className="h-auto p-0 font-semibold text-warn"
                      onClick={() => resolve(conflict, false)}
                      variant="link"
                    >
                      {t("generate.keepLocked")}
                    </Button>
                  </span>
                </div>
              ))}
              {working ? <Drafting /> : null}
            </div>
            <form
              className="flex items-center gap-2 border-t border-border px-3.5 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <Input
                aria-label={t("generate.ask")}
                className="h-10 flex-1"
                disabled={!aiHealth.available}
                onChange={(event) => setAsk(event.target.value)}
                placeholder={t("generate.ask")}
                value={ask}
              />
              <Button
                aria-label={t("generate.send")}
                className="size-10 p-0"
                disabled={!aiHealth.available || working}
                type="submit"
              >
                <Send aria-hidden="true" />
              </Button>
            </form>
          </Card>
          <div className="flex flex-col gap-2.5">
            {preview.map((section) => (
              <ChangeCard
                actions={
                  <button
                    aria-label={t(section.locked ? "generate.unlock" : "generate.lock", {
                      title: section.title,
                    })}
                    aria-pressed={section.locked}
                    className="flex text-muted hover:text-ink"
                    onClick={() =>
                      setPreview((current) =>
                        current.map((s) =>
                          s.key === section.key ? { ...s, locked: !s.locked } : s,
                        ),
                      )
                    }
                    type="button"
                  >
                    {section.locked ? (
                      <Lock aria-hidden="true" className="size-4" />
                    ) : (
                      <LockOpen aria-hidden="true" className="size-4" />
                    )}
                  </button>
                }
                after={section.text}
                before={section.before}
                key={section.key}
                tag={t(
                  section.locked
                    ? "change.tag.locked"
                    : section.status === "changed"
                      ? "generate.changedThisTurn"
                      : section.status === "new"
                        ? "change.tag.new"
                        : "change.tag.unchanged",
                )}
                title={section.title}
                tone={section.locked ? "locked" : section.status}
              />
            ))}
            {aiHealth.available ? null : (
              <p className="flex items-center gap-2 rounded-lg bg-warn-soft px-3.5 py-2.5 text-[13px] text-warn">
                <TriangleAlert aria-hidden="true" className="size-4" />
                {t("generate.paused")}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const toPreview = (section: SectionText): PreviewSection => ({
  before: section.text,
  key: section.key,
  locked: false,
  status: "unchanged",
  text: section.text,
  title: section.title,
});

const Drafting = () => {
  const { t } = useTranslation("ai");
  return (
    <p className="flex items-center gap-2 text-muted">
      <Spinner className="size-3 text-primary" />
      {t("generate.drafting")}
    </p>
  );
};
