// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { NotFound } from "@steward-web/ui";
import { data } from "react-router";

/**
 * The stand-in for a destination the shell shows (H1) but that isn't built yet: To acknowledge,
 * Ask, Templates, the audit log, the inbox and the rest in `COMING_SOON`. It answers 404, so a
 * planned page never passes for a real one, and its feature PR replaces the route.
 */
export const loader = () => data(null, { status: 404 });

export default function ComingSoon() {
  const { t } = useTranslation("shell");
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <NotFound description={t("comingSoon.description")} title={t("comingSoon.title")} />
    </div>
  );
}
