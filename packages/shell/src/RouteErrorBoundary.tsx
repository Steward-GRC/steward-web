// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { NotFound } from "@steward-web/ui";
import { isRouteErrorResponse, useLocation, useRouteError } from "react-router";

import { PageError } from "./PageError";
import { refusalOf } from "./refusal";

/** What a loader throws (`data(…, { status: 404 })`) when a numbered document isn't there. */
export interface NotFoundData {
  kind: "policy" | "procedure";
  number: string;
}

const isNotFoundData = (value: unknown): value is NotFoundData =>
  typeof value === "object" &&
  value !== null &&
  ((value as NotFoundData).kind === "policy" || (value as NotFoundData).kind === "procedure") &&
  typeof (value as NotFoundData).number === "string";

/** What `requireRole` throws (`data({ needs }, { status: 403 })`) when a role is missing. */
const isNeedsRole = (value: unknown): value is { needs: string } =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { needs?: unknown }).needs === "string";

/**
 * Every route's `ErrorBoundary` content, inside the app's shell when the root could load. A
 * 404 is Not found (U7s, 6-states.s3): "Policy not found / No policy matches {number}." for a
 * numbered document, "Page not found" for an unknown address, each with its way back. Anything
 * else is the page error (G17, 6-states.s4).
 */
export const RouteErrorBoundary = () => {
  const { t } = useTranslation("errors");
  const error = useRouteError();
  const location = useLocation();

  if (isRouteErrorResponse(error) && error.status === 404) {
    if (isNotFoundData(error.data)) {
      const { kind, number } = error.data;
      return (
        <div className="mx-auto my-10 w-[calc(100%-32px)] max-w-[520px]">
          <NotFound
            back={{
              label: t(`notFound.${kind}.back`),
              to: kind === "policy" ? "/policies" : "/procedures",
            }}
            description={t(`notFound.${kind}.description`, { number })}
            title={t(`notFound.${kind}.title`)}
          />
        </div>
      );
    }
    return (
      <div className="mx-auto my-10 w-[calc(100%-32px)] max-w-[520px]">
        <NotFound
          back={{ label: t("notFound.page.back"), to: "/" }}
          description={t("notFound.page.description", { path: location.pathname })}
          title={t("notFound.page.title")}
        />
      </div>
    );
  }

  if (isRouteErrorResponse(error) && error.status === 403 && isNeedsRole(error.data)) {
    const { needs } = error.data;
    return (
      <div className="mx-auto my-10 w-[calc(100%-32px)] max-w-[520px]">
        <NotFound
          back={{ label: t("notFound.page.back"), to: "/" }}
          description={t(`needsRole.${needs}.description`, {
            defaultValue: t("refusal.forbidden"),
          })}
          title={t(`needsRole.${needs}.title`, { defaultValue: t("refusal.forbidden") })}
        />
      </div>
    );
  }

  return (
    <PageError
      failure={refusalOf(isRouteErrorResponse(error) ? { status: error.status } : error)}
    />
  );
};
