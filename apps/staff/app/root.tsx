// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { IdentityProvider } from "@steward-web/auth";
import { identityFromRequest } from "@steward-web/auth/server";
import { DEFAULT_LOCALE } from "@steward-web/i18n";
import { MockBanner } from "@steward-web/mock-banner";
import { AppShell, DiagnosticsProvider } from "@steward-web/shell";
import { Toaster } from "@steward-web/ui";
import stewardCss from "@steward-web/ui/steward.css?url";
import { type ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, type ShouldRevalidateFunctionArgs } from "react-router";

import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [{ href: stewardCss, rel: "stylesheet" }];

export const loader = async ({ request }: Route.LoaderArgs) => ({
  identity: await identityFromRequest(request),
});

// The identity never changes within one request/response cycle; re-running the root
// loader on every link click would be a wasted round trip to the gateway on each
// navigation.
export const shouldRevalidate = ({ formAction }: ShouldRevalidateFunctionArgs) =>
  formAction != undefined;

// DiagnosticsProvider lives here, not inside the default App component: Layout wraps both
// the normal route tree AND the route error boundary, so Copy diagnostics is live even on a
// page this app's own chrome never got to render.
export const Layout = ({ children }: { children: ReactNode }) => (
  <html lang={DEFAULT_LOCALE}>
    <head>
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <Meta />
      <Links />
    </head>
    <body>
      <DiagnosticsProvider>
        {children}
        <Toaster />
      </DiagnosticsProvider>
      <Scripts />
    </body>
  </html>
);

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <IdentityProvider identity={loaderData.identity}>
      <AppShell>
        <MockBanner />
        <Outlet />
      </AppShell>
    </IdentityProvider>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "@steward-web/shell";
