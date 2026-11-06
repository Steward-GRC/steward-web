// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { IdentityProvider } from "@steward-web/auth";
import { identityFromRequest } from "@steward-web/auth/server";
import { statusGatePreview } from "@steward-web/dev-gate-preview.server";
import { QuickLoginBar } from "@steward-web/dev-quick-login";
import { quickLoginUsers } from "@steward-web/dev-quick-login.server";
import { DevelopmentUiIssueButton } from "@steward-web/dev-ui-issue-button";
import { DEFAULT_LOCALE } from "@steward-web/i18n";
import {
  AdminShell,
  AdminsOnlyGate,
  DiagnosticsProvider,
  GateShell,
  MaintenanceGate,
  PageTitle,
  RouteErrorBoundary,
  RoutePending,
  statusGateFor,
  useAccessRevalidation,
  useIsGate,
} from "@steward-web/shell";
import { siteSettingsFromRequest } from "@steward-web/shell/server";
import {
  brandLinks,
  brandMeta,
  PREFERENCES_BOOT_SCRIPT,
  ThemeProvider,
  Toaster,
} from "@steward-web/ui";
import stewardCss from "@steward-web/ui/steward.css?url";
import { type ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, useRouteLoaderData } from "react-router";

import type { Route } from "./+types/root";

import { adminShellData } from "./shell/shellData.server";
import { PAGE_TITLES } from "./titles";

export const links: Route.LinksFunction = () => [
  { href: stewardCss, rel: "stylesheet" },
  ...brandLinks(import.meta.env.BASE_URL),
];

// The designed browser-chrome colours from the brand's head snippet. The page title is
// `PageTitle` in Layout's head.
export const meta: Route.MetaFunction = () => brandMeta();

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [identity, siteSettings] = await Promise.all([
    identityFromRequest(request),
    siteSettingsFromRequest(request),
  ]);
  const quickLogin = await quickLoginUsers();
  return {
    // A dev build's `?gate=G11` or `?gate=G12` holds that gate on screen; never in a release.
    gatePreview: statusGatePreview(new URL(request.url)),
    devUiIssueCopy: process.env.STEWARD_DEV_UI_ISSUE_COPY === "true",
    identity,
    // Reused, not re-checked: quickLoginUsers() is already both build- and runtime-gated (empty
    // in any build or deployment that doesn't allow the dev quick login).
    quickLoginOn: quickLogin.length > 0,
    shell: await adminShellData(request, identity),
    siteSettings,
  };
};

// Following a link keeps the identity and the site banners; a form action reloads them, and so
// does a change to the signed-in person's access or the tab regaining focus (#7).
export { shouldRevalidateShell as shouldRevalidate } from "@steward-web/shell";

// DiagnosticsProvider lives here, not inside the default App component: Layout wraps both
// the normal route tree AND the route error boundary, so Copy diagnostics is live even on a
// page this app's own chrome never got to render.
//
// The theme (decision 3-colour-type-tokens.s3): the boot script puts the saved choice, or
// "system", on <html> before the first paint, so there's no light flash for a dark-theme
// reader; ThemeProvider takes over after hydration. <html>'s class is the script's to set,
// hence suppressHydrationWarning there.
export const Layout = ({ children }: { children: ReactNode }) => (
  <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
    <head>
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <script dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOT_SCRIPT }} />
      <PageTitle titles={PAGE_TITLES} />
      <Meta />
      <Links />
    </head>
    <body>
      <ThemeProvider>
        <DiagnosticsProvider>
          {children}
          <Toaster />
        </DiagnosticsProvider>
      </ThemeProvider>
      <Scripts />
    </body>
  </html>
);

/** G12's sample person for the dev preview. */
const PREVIEW_NAME = "Erin Reader";

export default function App({ loaderData }: Route.ComponentProps) {
  // Sign-in and the other gates sit outside the shell as a centred card (2-layout-and-navigation.s5).
  const gate = useIsGate();
  const developmentLogin = loaderData.quickLoginOn ? <QuickLoginBar enabled /> : null;
  const { identity, shell, siteSettings } = loaderData;
  useAccessRevalidation(identity.id !== "");
  const preview = loaderData.gatePreview;
  // The console stays open to site admins during maintenance so they can lift it (G11), and
  // turns away anyone signed in with no way into it (G12).
  const status =
    preview === "G11"
      ? "maintenance"
      : preview === "G12"
        ? "adminsOnly"
        : statusGateFor({ app: "admin", identity, settings: siteSettings });
  if (status) {
    return (
      <IdentityProvider identity={identity}>
        <GateShell devLogin={developmentLogin} environment={shell.config.environment}>
          <DevelopmentUiIssueButton app="admin" enabled={loaderData.devUiIssueCopy} />
          {status === "maintenance" ? (
            <MaintenanceGate message={siteSettings?.maintenance.message ?? ""} />
          ) : (
            <AdminsOnlyGate
              name={preview === "G12" ? PREVIEW_NAME : identity.name}
              staffUrl={shell.config.staffUrl}
            />
          )}
        </GateShell>
      </IdentityProvider>
    );
  }
  if (gate) {
    return (
      <IdentityProvider identity={loaderData.identity}>
        <GateShell
          banners={loaderData.siteSettings}
          devLogin={developmentLogin}
          environment={loaderData.shell.config.environment}
        >
          <DevelopmentUiIssueButton app="admin" enabled={loaderData.devUiIssueCopy} />
          <Outlet />
        </GateShell>
      </IdentityProvider>
    );
  }
  return (
    <IdentityProvider identity={loaderData.identity}>
      <AdminShell
        banners={loaderData.siteSettings}
        categories={loaderData.shell.categories}
        config={loaderData.shell.config}
        devLogin={developmentLogin}
        reporting={loaderData.shell.reporting}
      >
        <DevelopmentUiIssueButton app="admin" enabled={loaderData.devUiIssueCopy} />
        <RoutePending>
          <Outlet />
        </RoutePending>
      </AdminShell>
    </IdentityProvider>
  );
}

/**
 * Errors (G17) and Not found (6-states.s3) render inside the app's shell when the root could
 * load, so the header and navigation stay; a gate's error, or one before the root loaded,
 * renders on the bare gate page.
 */
export const ErrorBoundary = () => {
  const loaderData = useRouteLoaderData<typeof loader>("root");
  const gate = useIsGate();
  const developmentLogin = loaderData?.quickLoginOn ? <QuickLoginBar enabled /> : null;
  if (!loaderData || gate) {
    return (
      <GateShell
        devLogin={developmentLogin}
        environment={loaderData?.shell.config.environment ?? null}
      >
        <RouteErrorBoundary />
      </GateShell>
    );
  }
  return (
    <IdentityProvider identity={loaderData.identity}>
      <AdminShell
        banners={loaderData.siteSettings}
        categories={loaderData.shell.categories}
        config={loaderData.shell.config}
        devLogin={developmentLogin}
        reporting={loaderData.shell.reporting}
      >
        <RouteErrorBoundary />
      </AdminShell>
    </IdentityProvider>
  );
};
