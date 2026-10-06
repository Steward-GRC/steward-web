// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Banner } from "@steward-web/ui";

import { MOCK_MARKER } from "./marker";

/**
 * Mounted once at the shell root on a mock build, and never on a live one — there is no prop
 * or env check here that could leave it showing by mistake; the shell only renders this
 * component at all when `@steward-web/vite-config`'s `chooseEdge` picked the mock edge.
 */
export const MockBanner = () => {
  const { t } = useTranslation("shell");
  return (
    <div data-steward-mock={MOCK_MARKER}>
      <Banner title={t("mockBanner.title")} tone="warn" />
    </div>
  );
};
