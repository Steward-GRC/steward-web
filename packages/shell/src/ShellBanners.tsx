// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { KeyRound, UserRound, WifiOff, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Form, Link, useHref } from "react-router";

import { STATUS_PATH } from "./status";

/** Where the staff app stops an impersonation (the gateway's `stopImpersonation`). */
export const IMPERSONATION_PATH = "/resources/impersonation";

const MINUTE = 60_000;

/** Minutes left until `expiresAt`, rounded up, ticking once a minute. */
const useMinutesLeft = (expiresAt: string) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), MINUTE / 4);
    return () => clearInterval(timer);
  }, []);
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / MINUTE));
};

/**
 * Acting as a user (H9; decision 2-layout-and-navigation.s8): plum with a saffron underline,
 * above everything, "You are acting as {name}", the minutes left and that actions are audited,
 * and Stop. It can't be dismissed: it stays for the whole session.
 */
export const ActingAsBanner = ({
  session,
}: {
  session: { expiresAt: string; targetName: string };
}) => {
  const { t } = useTranslation("shell");
  const minutes = useMinutesLeft(session.expiresAt);
  const labelId = useId();
  return (
    <section
      aria-labelledby={labelId}
      className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 bg-primary px-4 py-1.5 text-base text-on-primary shadow-[inset_0_-3px_#e2a336]"
      data-testid="acting-as-banner"
    >
      <UserRound aria-hidden="true" className="size-[18px]" />
      <h2 className="sr-only" id={labelId}>
        {t("banners.actingAs.label", { name: session.targetName })}
      </h2>
      <span>
        {t("banners.actingAs.before")}
        <b>{session.targetName}</b>
      </span>
      <span className="opacity-85">{t("banners.actingAs.detail", { minutes })}</span>
      <Form action={IMPERSONATION_PATH} className="ml-auto" method="post">
        <button
          className="flex h-[30px] items-center rounded-md bg-surface px-3.5 font-bold text-primary hover:bg-primary-soft"
          name="intent"
          type="submit"
          value="stop"
        >
          {t("banners.actingAs.stop")}
        </button>
      </Form>
    </section>
  );
};

/**
 * Connection lost (H7): an ink strip, "Can't reach the server — reconnecting…", while the
 * browser is offline or the app's status route stops answering. It checks again on its own and
 * clears by itself.
 */
export const ConnectionLostBanner = ({ checkEvery = 30_000 }: { checkEvery?: number }) => {
  const { t } = useTranslation("shell");
  const statusUrl = useHref(STATUS_PATH);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      try {
        const response = await fetch(statusUrl, { cache: "no-store" });
        if (!cancelled) setLost(!response.ok);
      } catch {
        if (!cancelled) setLost(true);
      }
    };
    const offline = () => setLost(true);
    const online = () => void probe();
    globalThis.addEventListener("offline", offline);
    globalThis.addEventListener("online", online);
    const timer = setInterval(() => void probe(), lost ? Math.min(checkEvery, 5000) : checkEvery);
    return () => {
      cancelled = true;
      globalThis.removeEventListener("offline", offline);
      globalThis.removeEventListener("online", online);
      clearInterval(timer);
    };
  }, [checkEvery, lost, statusUrl]);

  return (
    <div aria-live="polite" role="status">
      {lost ? (
        <div className="flex items-center gap-2.5 bg-ink px-4 py-2.5 text-base text-background">
          <WifiOff aria-hidden="true" className="size-[1.15em]" />
          {t("banners.connectionLost")}
        </div>
      ) : null}
    </div>
  );
};

const NUDGE_KEY = "steward.secondFactorNudge.dismissedAt";
const NUDGE_QUIET_MS = 24 * 60 * MINUTE;

const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(NUDGE_KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < NUDGE_QUIET_MS;
  } catch {
    return false;
  }
};

/**
 * The second-factor nudge (H8): for someone with only email codes, "Add an authenticator app or
 * passkey for stronger sign-in — email codes still work.", Set up, and a dismiss that hides it
 * for 24 hours in this browser.
 */
export const SecondFactorNudge = ({ setUpUrl }: { setUpUrl: string }) => {
  const { t } = useTranslation("shell");
  const [hidden, setHidden] = useState(dismissedRecently);
  if (hidden) return null;
  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-surface px-4 py-2.5 text-base text-ink">
      <KeyRound aria-hidden="true" className="size-[1.15em] flex-none" />
      <span>{t("banners.secondFactor.body")}</span>
      <Link
        className="ml-auto flex-none font-semibold whitespace-nowrap text-primary"
        to={setUpUrl}
      >
        {t("banners.secondFactor.setUp")}
      </Link>
      <button
        aria-label={t("banners.secondFactor.dismiss")}
        className="flex flex-none text-muted hover:text-ink"
        onClick={() => {
          try {
            localStorage.setItem(NUDGE_KEY, String(Date.now()));
          } catch {
            // Storage can be blocked; it's still hidden for this page.
          }
          setHidden(true);
        }}
        type="button"
      >
        <X aria-hidden="true" className="size-[1.15em]" />
      </button>
    </div>
  );
};
