// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ReachError } from "@steward-web/ui";
import { isRouteErrorResponse, useRouteError } from "react-router";

import { refusalOf } from "./refusal";

/**
 * Every route's `ErrorBoundary`, mounted once per app (`app/root.tsx`). A thrown
 * `Response` (a loader's `redirect`, a 404) and a thrown `Error` (a failed gateway or
 * Kratos call) both become one typed `Failure`; `ReachError` already carries its own
 * generic, backend-text-free description and the Copy diagnostics button.
 */
export const RouteErrorBoundary = () => {
  const { t } = useTranslation("errors");
  const error = useRouteError();
  const failure = refusalOf(isRouteErrorResponse(error) ? { status: error.status } : error);

  return (
    <div className="mx-auto max-w-lg py-16">
      <ReachError action={t("route.action")} failure={failure} />
    </div>
  );
};
