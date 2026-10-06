// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { type Failure, toFailure } from "@steward-web/ui";

/**
 * Turns anything a loader, action or client fetch threw into the typed, allow-listed
 * `Failure` every refusal and error treatment renders. Duck-typed on purpose: a
 * `GatewayError` (`@steward-web/api-client`), a `KratosError` (`@steward-web/auth`), a bare
 * `Response`, or a generic `Error` all expose a subset of the same field names, and
 * `toFailure` only ever copies the fields it recognizes.
 */
export const refusalOf = (error: unknown): Failure =>
  toFailure(error && typeof error === "object" ? (error as Record<string, unknown>) : {});

/**
 * A generic, backend-text-free one-liner for a screen that has no more specific message of
 * its own (the route error boundary, in particular). The backend's own message is never
 * shown: it can echo policy content.
 */
export const useRefusalMessage = (failure: Failure): string => {
  const { t } = useTranslation("errors");
  switch (failure.status) {
    case 401: {
      return t("refusal.signedOut");
    }
    case 403: {
      return t("refusal.forbidden");
    }
    case 404: {
      return t("refusal.notFound");
    }
    default: {
      return t("refusal.generic");
    }
  }
};
