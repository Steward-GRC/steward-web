// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType } from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import { useId, useState } from "react";
import { useFetcher } from "react-router";

import { Select } from "#ui/components/Controls";
import { Banner } from "#ui/feedback/Banner";
import { type Failure } from "#ui/feedback/failure";
import { EmptyState } from "#ui/feedback/States";
import { cn } from "#ui/lib/cn";

import type {
  PolicySectionDiff,
  PolicyVersionOption,
  PolicyVersionSummary,
} from "./policyReaderModel";

import { AiSummaryCard } from "./AiSummaryCard";
import { DiffView } from "./WordDiff";

/** The resource route both apps answer with `{ diff }` for `?from=&to=` (U19). */
export const VERSION_DIFF_PATH = "/resources/version-diff";

/** The gateway's status word as the picker's key: "in_review" -> "inReview". */
const statusKey = (status: string) =>
  status.toLowerCase().replaceAll(/[_-]([a-z])/g, (_, letter: string) => letter.toUpperCase());

const picker =
  "h-[38px] w-auto min-w-44 border-0 px-3 font-mono text-sm font-medium shadow-[inset_0_0_0_1px_var(--control)] hc:border hc:border-control";

export interface CompareVersionsProps {
  /** Whether AI can summarise; "Summarise changes" says when it can't. */
  aiDown: boolean;
  documentType: DocumentType;
  /** The current version against the one before it, as the loader diffed them. */
  initial: PolicyVersionSummary;
  /** Every version the caller can read, oldest first. */
  versions: readonly PolicyVersionOption[];
}

/**
 * Changes and Compare versions (U12, U19): "Compare versions" with the from → to pickers,
 * starting at the version before the current one and the current one; "Summarise changes"
 * when AI can't run; then the word-level diff. Picking a version loads that pair's diff.
 */
export const CompareVersions = ({
  aiDown,
  documentType,
  initial,
  versions,
}: CompareVersionsProps) => {
  const { t } = useTranslation("policy");
  const fetcher = useFetcher<{ diff: readonly PolicySectionDiff[]; failure?: Failure }>();
  const titleId = useId();
  const [from, setFrom] = useState(initial.fromVersionId ?? "");
  const [to, setTo] = useState(initial.toVersionId ?? "");
  const [picked, setPicked] = useState(false);

  const options = versions.map((version) => ({
    label: t("reader.compare.option", {
      status: t(`reader.compare.status.${statusKey(version.status)}`, {
        defaultValue: version.status.toLowerCase().replaceAll("_", " "),
      }),
      version: version.version,
    }),
    value: version.id,
  }));

  const pick = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    setPicked(true);
    void fetcher.load(
      `${VERSION_DIFF_PATH}?${new URLSearchParams({ from: nextFrom, to: nextTo }).toString()}`,
    );
  };

  const diff = picked && fetcher.data ? fetcher.data.diff : initial.diff;
  const loading = fetcher.state !== "idle";

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-60 flex-1 flex-col gap-[3px]">
          <h2 className="text-[22px] font-semibold" id={titleId}>
            {t("reader.compare.title")}
          </h2>
          <p className="text-sm text-muted">
            {t(
              documentType === DocumentType.Procedure
                ? "reader.compare.description.procedure"
                : "reader.compare.description.policy",
              { first: versions[0]?.version ?? initial.version },
            )}
          </p>
        </div>
        {versions.length > 1 ? (
          <div className="flex items-center gap-3">
            <Select
              aria-label={t("reader.compare.from")}
              className={picker}
              onValueChange={(value) => pick(value, to)}
              options={options}
              value={from}
            />
            <span aria-hidden="true" className="text-base font-semibold text-muted">
              →
            </span>
            <Select
              aria-label={t("reader.compare.to")}
              className={picker}
              onValueChange={(value) => pick(from, value)}
              options={options}
              value={to}
            />
          </div>
        ) : null}
      </div>
      {aiDown ? (
        <AiSummaryCard title={t("reader.changes.summarise")}>
          {t("reader.summary.unavailable")}
        </AiSummaryCard>
      ) : null}
      {picked && fetcher.data?.failure ? (
        <Banner failure={fetcher.data.failure} title={t("reader.compare.failed")} tone="danger" />
      ) : (
        <div aria-busy={loading} className={cn(loading && "opacity-60")}>
          {diff.every((section) => section.changeType.toLowerCase() === "unchanged") ? (
            <EmptyState title={t("reader.changes.empty")} />
          ) : (
            <DiffView sections={diff} />
          )}
        </div>
      )}
    </section>
  );
};
