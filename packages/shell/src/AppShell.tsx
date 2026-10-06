// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Lockup, Menu, MenuContent, MenuItem, MenuTrigger } from "@steward-web/ui";
import { type ReactNode, useState } from "react";
import { Link } from "react-router";

import { AboutDiagnostics } from "./AboutDiagnostics";

/**
 * The header, account menu (today, About and diagnostics plus Your profile; sign-out lands
 * with its own feature area) and main content area both apps mount inside their root
 * `Layout`. `Layout` is what carries `DiagnosticsProvider` and the toast host (see each app's
 * `root.tsx`): it wraps the route tree AND the route error boundary, so Copy diagnostics is
 * live even on a page this shell never got to render.
 */
export const AppShell = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation("shell");
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr]">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <Lockup />
        <Menu>
          <MenuTrigger asChild>
            <button
              aria-label={t("about.menuEntry")}
              className="rounded-md p-2 hover:bg-sunken"
              type="button"
            >
              <Lockup size={20} />
            </button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem asChild>
              <Link to="/profile">{t("account.profile")}</Link>
            </MenuItem>
            <MenuItem onSelect={() => setAboutOpen(true)}>{t("about.menuEntry")}</MenuItem>
          </MenuContent>
        </Menu>
      </header>
      <main>{children}</main>
      <AboutDiagnostics onOpenChange={setAboutOpen} open={aboutOpen} />
    </div>
  );
};
