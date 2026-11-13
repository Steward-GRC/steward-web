// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { VersionChangeInfo } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";

import { Badge } from "#ui/components/Badges";
import { Card } from "#ui/components/Display";

const TONE = { fix: "neutral", major: "warn", minor: "info" } as const;

/**
 * How a version's change type came about (#390): what Steward suggested, what it applies as,
 * a lowering the author asked for that the first approval stage has not agreed to, why, and who
 * set and agreed to it. `names` is the label for each user id; an id with none shows as itself.
 * Nothing shows when core has no change type for the version.
 */
export const ChangeTypeSummary = ({
  change,
  names = {},
}: {
  change: VersionChangeInfo;
  names?: Readonly<Record<string, string>>;
}) => {
  const { t } = useTranslation("policy");
  if (!change.suggestedChangeType && !change.changeType && !change.requestedChangeType) {
    return null;
  }
  const who = (id: string) => names[id] ?? id;
  const kind = (value: keyof typeof TONE) => (
    <Badge tone={TONE[value]}>{t(`change.${value}`)}</Badge>
  );
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (change.suggestedChangeType) {
    rows.push({ label: t("changeSummary.suggested"), value: kind(change.suggestedChangeType) });
  }
  if (change.changeType) {
    rows.push({ label: t("changeSummary.applied"), value: kind(change.changeType) });
  }
  if (change.requestedChangeType) {
    rows.push({
      label: t("changeSummary.requested"),
      value: (
        <span className="flex flex-wrap items-center gap-2">
          {kind(change.requestedChangeType)}
          <span className="text-muted">{t("changeSummary.waiting")}</span>
        </span>
      ),
    });
  }
  if (change.reason) rows.push({ label: t("changeSummary.reason"), value: change.reason });
  if (change.setByUserId) {
    rows.push({ label: t("changeSummary.setBy"), value: who(change.setByUserId) });
  }
  if (change.agreedByUserIds.length > 0) {
    rows.push({
      label: t("changeSummary.agreedBy"),
      value: change.agreedByUserIds.map(who).join(", "),
    });
  } else if (change.requestedChangeType) {
    rows.push({ label: t("changeSummary.agreedBy"), value: t("changeSummary.nobodyYet") });
  }
  return (
    <Card title={t("changeSummary.title")}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 px-4 py-3.5 text-sm">
        {rows.map((row) => (
          <div className="contents" key={row.label}>
            <dt className="text-muted">{row.label}</dt>
            <dd className="min-w-0 break-words">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};
