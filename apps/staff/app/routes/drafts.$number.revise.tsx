// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Revise with AI (Authoring U31, Flow 8): say what should change, let Steward work out a change
// set across the whole draft, review it section by section, then apply it to the draft in the
// editor. Nothing changes until the author applies it, and the editor still needs saving.
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest, requireRoleFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Card, Input } from "@steward-web/ui";
import { AiJobProgress, draftPath } from "@steward-web/ui/domain";
import { Ellipsis } from "lucide-react";
import { useId, useState } from "react";
import { data, Link, useFetcher, useLocation, useNavigate } from "react-router";

import type { Route } from "./+types/drafts.$number.revise";

import { submitPolicyRevision } from "../authoring/ai.server";
import { aiOffReason } from "../authoring/ai/aiOff";
import { loadDraftForAi } from "../authoring/ai/aiPage.server";
import { ChangeCard } from "../authoring/ai/ChangeCard";
import { changeSetOf, parseRevisionResult } from "../authoring/ai/results";
import { useAiJob } from "../authoring/ai/useAiJob";
import { policyIdOfNumber } from "../authoring/authoring.server";
import { type SectionText } from "../authoring/sections";
import { useAiHealth } from "../authoring/useAiHealth";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requireRoleFromRequest(request, PERMISSIONS.PolicyAuthor, "author");
  const { aiHealth, draftId, policy, sections } = await loadDraftForAi(request, params.number);
  return { aiHealth, draftId, policy, sections };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const policyId = await policyIdOfNumber(request, params.number);
  const form = await request.formData();
  if (form.get("intent") !== "revise") throw new Response("Bad Request", { status: 400 });
  const sections = JSON.parse(String(form.get("sectionsJson") ?? "[]")) as SectionText[];
  try {
    const { jobId } = await submitPolicyRevision(request, {
      instruction: String(form.get("instruction") ?? ""),
      policyId,
      sections: sections.map((section, order) => ({
        content: section.text,
        key: section.key,
        order,
        title: section.title,
      })),
      versionId: String(form.get("versionId") ?? ""),
    });
    return data({ jobId, ok: true as const });
  } catch (error) {
    return data({ error: refusalOf(error), ok: false as const }, { status: 400 });
  }
};

export default function Revise({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("ai");
  const { t: tAuthoring } = useTranslation("authoring");
  const location = useLocation();
  const navigate = useNavigate();
  const ids = useId();
  const { aiHealth: seeded, draftId, policy } = loaderData;
  const aiHealth = useAiHealth(seeded);
  // The editor hands over its live sections; a page opened on its own reads the stored ones.
  const handed = (location.state as { sections?: SectionText[] } | null)?.sections;
  const sections = handed ?? loaderData.sections;

  const [instruction, setInstruction] = useState("");
  const [showUnchanged, setShowUnchanged] = useState(false);
  const fetcher = useFetcher<typeof action>();
  const [attempt, setAttempt] = useState(0);
  const jobId =
    attempt > 0 && fetcher.data?.ok && "jobId" in fetcher.data ? fetcher.data.jobId : null;
  const job = useAiJob(jobId, fetcher.state !== "idle");
  const changes =
    job.stage === "done" ? changeSetOf(sections, parseRevisionResult(job.resultJson)) : null;

  const generate = () => {
    setAttempt((value) => value + 1);
    setShowUnchanged(false);
    void fetcher.submit(
      {
        instruction: instruction.trim(),
        intent: "revise",
        sectionsJson: JSON.stringify(sections),
        versionId: draftId,
      },
      { method: "post" },
    );
  };
  const startOver = () => {
    setAttempt(0);
    setInstruction("");
  };
  const apply = () => {
    if (!changes) return;
    void navigate(draftPath(policy.number), { state: { aiApply: { entries: changes.entries } } });
  };

  const refused = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;
  const visible = changes?.entries.filter((entry) => entry.kind !== "unchanged") ?? [];
  const unchanged = changes?.entries.filter((entry) => entry.kind === "unchanged") ?? [];

  return (
    <div className="flex flex-col gap-3.5 px-4 pt-[22px] pb-8 text-ink sm:px-8">
      <div className="flex flex-col gap-1">
        <Link
          className="text-xs font-medium text-muted hover:underline"
          to={draftPath(policy.number)}
        >
          {t("revise.back")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("revise.title", { title: policy.title })}</h1>
      </div>
      {aiHealth.available ? null : (
        <Banner title={tAuthoring(aiOffReason(aiHealth.reason))} tone="warn" />
      )}
      <form
        className="flex flex-col gap-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <label className="text-[13px] font-medium" htmlFor={`${ids}-instruction`}>
          {t("revise.question")}
        </label>
        <div className="flex flex-wrap gap-2">
          <Input
            className="h-11 min-w-0 flex-1 text-sm"
            id={`${ids}-instruction`}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder={t("revise.placeholder")}
            required
            value={instruction}
          />
          <Button
            className="h-11"
            disabled={!aiHealth.available || job.stage === "queued" || job.stage === "generating"}
            type="submit"
          >
            {t("revise.generate")}
          </Button>
        </div>
      </form>
      {refused ? <Banner title={t("refused")} tone="danger" /> : null}

      {job.stage && job.stage !== "done" ? (
        <Card className="p-[18px]">
          <AiJobProgress error={job.error} onRetry={generate} stage={job.stage} />
        </Card>
      ) : null}

      {changes ? (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[13px] font-semibold">
              {t("revise.counts", {
                changed: changes.counts.changed,
                new: changes.counts.new,
                removed: changes.counts.removed,
                unchanged: changes.counts.unchanged,
              })}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <Button className="h-auto p-0 font-semibold" onClick={startOver} variant="link">
                {t("revise.startOver")}
              </Button>
              {changes.nothing ? null : (
                <Button className="h-9 px-3.5" onClick={apply}>
                  {t("revise.apply")}
                </Button>
              )}
            </div>
          </div>
          {changes.nothing ? (
            <p className="rounded-[10px] border border-border bg-surface px-4 py-3 text-sm text-muted">
              {t("revise.nothing")}
            </p>
          ) : null}
          {visible.map((entry) => (
            <ChangeCard
              after={entry.after || entry.before}
              before={entry.before}
              key={entry.key}
              tag={t(`change.tag.${entry.kind}`)}
              title={entry.title}
              tone={entry.kind}
            />
          ))}
          {unchanged.length > 0 && !changes.nothing ? (
            showUnchanged ? (
              unchanged.map((entry) => (
                <ChangeCard
                  after={entry.after}
                  before={entry.before}
                  key={entry.key}
                  tag={t("change.tag.unchanged")}
                  title={entry.title}
                  tone="unchanged"
                />
              ))
            ) : (
              <button
                className="flex items-center gap-2 rounded-md bg-sunken px-3 py-2 text-left text-[13px] font-medium text-muted hover:text-ink"
                onClick={() => setShowUnchanged(true)}
                type="button"
              >
                <Ellipsis aria-hidden="true" className="size-4" />
                {t("revise.unchanged", { count: unchanged.length })}
              </button>
            )
          ) : null}
        </>
      ) : null}
    </div>
  );
}
