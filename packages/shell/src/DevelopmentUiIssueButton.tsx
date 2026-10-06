// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useIdentity } from "@steward-web/auth";
import { useLocale, useTranslation } from "@steward-web/i18n";
import {
  Button,
  Dialog,
  DialogContent,
  parsePreferences,
  PREFERENCES_STORAGE_KEY,
  Textarea,
} from "@steward-web/ui";
import { useEffect, useRef, useState } from "react";
import { useMatches } from "react-router";

import { buildUiIssueBundle } from "./uiIssueBundle";
import { getLastClicked, installUiIssueClickTracker } from "./uiIssueClickTracker";
import {
  getLastUiIssueError,
  getRecentUiIssueErrors,
  installUiIssueErrorListeners,
} from "./uiIssueErrorStore";
import { DEV_UI_ISSUE_MARKER } from "./uiIssueMarker";
import { pathPattern, stringParameters } from "./uiIssueRoute";

export interface DevelopmentUiIssueButtonProps {
  app: "admin" | "staff";
  /** The server env check (`STEWARD_DEV_UI_ISSUE_COPY=true`), decided by the root loader. */
  enabled: boolean;
}

const sha = (): string => (typeof __STEWARD_COMMIT__ === "string" ? __STEWARD_COMMIT__ : "unknown");

const readTheme = (): string =>
  parsePreferences(globalThis.localStorage?.getItem(PREFERENCES_STORAGE_KEY) ?? null).theme;

/**
 * The dev-only "Copy for UI issue" button: one click copies a schema-v1 bundle describing the
 * current page, for pasting into an issue report. Mounted via the `@steward-web/dev-ui-issue-
 * button` alias, which only resolves here when the build carried `DEV_UI_ISSUE_COPY=true`;
 * `enabled` is the second, independent gate, read from the server env by the root loader.
 */
export const DevelopmentUiIssueButton = ({ app, enabled }: DevelopmentUiIssueButtonProps) => {
  const { t } = useTranslation("shell");
  const identity = useIdentity();
  const { locale } = useLocale();
  const matches = useMatches();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallbackText, setFallbackText] = useState<string>();
  const fallbackRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const stopErrors = installUiIssueErrorListeners();
    const stopClicks = installUiIssueClickTracker();
    return () => {
      stopErrors();
      stopClicks();
    };
  }, [enabled]);

  useEffect(() => {
    if (fallbackText != undefined) fallbackRef.current?.select();
  }, [fallbackText]);

  if (!enabled) return null;

  const lastMatch = matches.at(-1);

  const onClick = async () => {
    setBusy(true);
    setCopied(false);
    try {
      const bundle = buildUiIssueBundle({
        app,
        clicked: getLastClicked(),
        dpr: globalThis.devicePixelRatio,
        lastErr: getLastUiIssueError(),
        locale,
        params: lastMatch ? stringParameters(lastMatch.params) : {},
        path: lastMatch ? pathPattern(lastMatch.pathname, lastMatch.params) : "",
        recentErrors: getRecentUiIssueErrors(),
        role: identity.roles.length > 0 ? identity.roles.join(",") : undefined,
        route: lastMatch?.id ?? "",
        sha: sha(),
        t: new Date(),
        theme: readTheme(),
        ua: globalThis.navigator.userAgent,
        vh: globalThis.innerHeight,
        vw: globalThis.innerWidth,
      });
      try {
        await globalThis.navigator.clipboard.writeText(bundle);
        setCopied(true);
      } catch {
        setFallbackText(bundle);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" data-steward-dev-ui-issue={DEV_UI_ISSUE_MARKER}>
      <Button busy={busy} onClick={() => void onClick()} size="sm" variant="secondary">
        {copied ? t("devUiIssue.copied") : t("devUiIssue.action")}
      </Button>
      <span aria-live="polite" className="sr-only" role="status">
        {copied ? t("devUiIssue.announced") : null}
      </span>
      <Dialog
        onOpenChange={(open) => !open && setFallbackText(undefined)}
        open={fallbackText != undefined}
      >
        <DialogContent title={t("devUiIssue.fallbackTitle")}>
          <p className="text-base text-muted">{t("devUiIssue.fallbackHint")}</p>
          <Textarea defaultValue={fallbackText} readOnly ref={fallbackRef} rows={6} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
