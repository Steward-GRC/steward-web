// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { NotFound } from "@steward-web/ui";

/**
 * The page a designed destination shows until it's built (H1, H2): "Coming soon". Each app's
 * `routes/coming-soon.tsx` renders it and answers 404, so a planned page never passes for a
 * real one.
 */
export const ComingSoonPage = () => {
  const { t } = useTranslation("shell");
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <NotFound description={t("comingSoon.description")} title={t("comingSoon.title")} />
    </div>
  );
};
