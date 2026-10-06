// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#ui/components/Display";
import { EmptyState } from "#ui/feedback/States";

import type { HistoryEntry, PolicyVersionSummary } from "./policyReader";

import { groupHistoryByVersion, plainTextOf } from "./policyReader";

const EVENT_BADGE: Record<HistoryEntry["kind"], string> = {
  changesRequested: "×",
  decided: "✓",
  inReview: "⏳",
  published: "✓",
  rejected: "×",
  submitted: "↑",
  superseded: "↺",
  withdrawn: "↺",
};

/**
 * The history & approvals accordion (U18): one section per version, newest (current)
 * version open by default, each an append-only timeline of that version's events.
 */
export const PolicyReaderHistory = ({ history }: { history: readonly HistoryEntry[] }) => {
  const { t } = useTranslation("policy");
  const groups = groupHistoryByVersion(history);

  if (groups.length === 0) {
    return <EmptyState title={t("reader.history.empty")} />;
  }

  return (
    <Accordion defaultValue={groups[0]!.version} type="single">
      {groups.map((group) => (
        <AccordionItem key={group.version} value={group.version}>
          <AccordionTrigger>{group.version}</AccordionTrigger>
          <AccordionContent>
            <ol className="grid gap-2">
              {group.events.map((event, index) => (
                <li className="flex items-start gap-2 text-sm" key={index}>
                  <span aria-hidden="true" className="mt-0.5 text-muted">
                    {EVENT_BADGE[event.kind] ?? "·"}
                  </span>
                  <div>
                    <p className="text-ink">
                      {t(`reader.history.events.${event.kind}`, { stage: event.stage ?? "" })}
                    </p>
                    <p className="text-muted">
                      {[event.actorName, event.at].filter(Boolean).join(" · ")}
                    </p>
                    {event.comment ? <p className="text-muted italic">{event.comment}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

/** The changes/compare panel (U12/U19): the current version's diff against the one it superseded. */
export const PolicyReaderChanges = ({
  priorVersion,
}: {
  priorVersion: null | PolicyVersionSummary | undefined;
}) => {
  const { t } = useTranslation("policy");

  if (!priorVersion || priorVersion.diff.length === 0) {
    return <EmptyState title={t("reader.changes.empty")} />;
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        {t("reader.changes.versusPrior", { version: priorVersion.version })}
      </p>
      <ul className="grid gap-3">
        {priorVersion.diff.map((section) => (
          <li className="grid gap-1" key={section.sectionKey}>
            <p className="font-semibold text-ink">{section.sectionTitle}</p>
            {section.wordDiffHtml ? (
              <p className="text-base text-ink">{plainTextOf(section.wordDiffHtml)}</p>
            ) : (
              <p className="text-base text-muted">{section.changeType}</p>
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">{t("reader.changes.legend")}</p>
    </div>
  );
};
