// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { EmptyState } from "@steward-web/ui";

/** What the case screens show while the Compliance module is switched off. */
export const ReportingOff = () => {
  const { t } = useTranslation("reporting");
  return (
    <div className="grid gap-6 p-6">
      <EmptyState description={t("off.description")} title={t("off.title")} />
    </div>
  );
};
