// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";

import { AccessibilityButton } from "./AccessibilityButton";

/**
 * The shell footer (H1): "© {year} {Organisation} · Steward" on the surface, 14/36 padding,
 * with the floating accessibility button at its right. The button is fixed to the window;
 * the 40 px spacer keeps the footer the designed height under it.
 */
export const ShellFooter = ({ organisation }: { organisation: null | string }) => {
  const { t } = useTranslation("shell");
  const values = { brand: t("brand.name"), organisation, year: new Date().getFullYear() };
  return (
    <footer className="flex items-center justify-between border-t border-border-strong bg-surface px-9 py-[14px] text-xs text-muted">
      <span>
        {organisation ? t("footer.copyright", values) : t("footer.copyrightNoOrganisation", values)}
      </span>
      <span aria-hidden="true" className="size-10" />
      <AccessibilityButton />
    </footer>
  );
};
