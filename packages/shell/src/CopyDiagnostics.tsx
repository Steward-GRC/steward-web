// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  DiagnosticsDocument,
  type Diagnostics as GatewayDiagnostics,
  gatewayFetch,
} from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import { Button, Dialog, DialogContent, type Failure, Textarea } from "@steward-web/ui";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { buildDiagnosticsText, type StewardFacts } from "./diagnosticsText";

const READ_BUDGET_MS = 3000;

const buildInfo = () => ({
  commit: typeof __STEWARD_COMMIT__ === "string" ? __STEWARD_COMMIT__ : "unknown",
  version: typeof __STEWARD_VERSION__ === "string" ? __STEWARD_VERSION__ : "dev",
});

const readSteward = async (): Promise<{
  actor?: GatewayDiagnostics["actor"];
  steward: StewardFacts;
}> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), READ_BUDGET_MS);
  try {
    const data = await gatewayFetch(DiagnosticsDocument, {}, "Diagnostics", {
      signal: controller.signal,
      url: "/query",
    });
    const { diagnostics } = data;
    return {
      actor: diagnostics.actor,
      steward: {
        appliance: diagnostics.appliance,
        gateway: diagnostics.gateway,
        release: diagnostics.release,
        services: diagnostics.services,
        thirdParty: diagnostics.thirdParty,
      },
    };
  } catch (error) {
    const status =
      error && typeof error === "object" ? (error as { status?: number }).status : undefined;
    return { steward: status === 401 ? "signed-out" : "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * The one Copy diagnostics button, registered into every warning, danger and failure
 * treatment the kit draws (`@steward-web/ui`'s `DiagnosticsSlot`) by `DiagnosticsProvider`.
 * `failure` is whatever that treatment is reporting; it is optional, so the shell's own
 * About and diagnostics entry can use the same button with nothing to report.
 */
export const CopyDiagnostics = ({ failure }: { failure?: Failure }) => {
  const { t } = useTranslation("shell");
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallbackText, setFallbackText] = useState<string>();
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  // The fallback text area must take focus and be announced (the clipboard API refused), not
  // rely on the dialog's own default focus landing on its close button.
  useEffect(() => {
    if (fallbackText != undefined) fallbackRef.current?.select();
  }, [fallbackText]);

  const onClick = async () => {
    setBusy(true);
    setCopied(false);
    try {
      const { actor, steward } = await readSteward();
      const text = buildDiagnosticsText({
        actor,
        app: buildInfo(),
        failure,
        route: location.pathname,
        steward,
        time: new Date(),
        url: `${globalThis.location.origin}${location.pathname}`,
        userAgent: globalThis.navigator.userAgent,
      });
      try {
        await globalThis.navigator.clipboard.writeText(text);
        setCopied(true);
      } catch {
        setFallbackText(text);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button busy={busy} onClick={() => void onClick()} size="sm" variant="secondary">
        {copied ? t("copyDiagnostics.copied") : t("copyDiagnostics.action")}
      </Button>
      <span aria-live="polite" className="sr-only" role="status">
        {copied ? t("copyDiagnostics.announced") : null}
      </span>
      <Dialog
        onOpenChange={(open) => !open && setFallbackText(undefined)}
        open={fallbackText != undefined}
      >
        <DialogContent title={t("copyDiagnostics.fallbackTitle")}>
          <p className="text-base text-muted">{t("copyDiagnostics.fallbackHint")}</p>
          <Textarea defaultValue={fallbackText} readOnly ref={fallbackRef} rows={12} />
        </DialogContent>
      </Dialog>
    </>
  );
};
