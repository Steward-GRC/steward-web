// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from "react";
import { useHref, useNavigate } from "react-router";

/** The resource route a signed-out page asks whether a session has appeared. */
export const SESSION_PATH = "/resources/session";

/** How often a visible signed-out page asks. */
export const SESSION_CHECK_MS = 5000;

/**
 * Notices a session made somewhere else (another tab, the mock's own sign-in) while this page
 * sits signed out. It asks `/resources/session` when the tab regains focus or becomes visible,
 * and every few seconds while it's visible. Once there's a session it moves on to `next` and
 * answers who is signed in, so the page can say so while the move happens. A failed check
 * changes nothing.
 */
export const useSessionWatch = (next: string): string | undefined => {
  const href = useHref(SESSION_PATH);
  const navigate = useNavigate();
  const [signedInAs, setSignedInAs] = useState<string>();

  useEffect(() => {
    let done = false;
    let asking = false;
    const check = async () => {
      if (done || asking || document.visibilityState === "hidden") return;
      asking = true;
      try {
        const response = await fetch(href, { headers: { accept: "application/json" } });
        if (!response.ok) return;
        const body = (await response.json()) as { name?: unknown; signedIn?: unknown };
        if (done || body.signedIn !== true) return;
        done = true;
        setSignedInAs(typeof body.name === "string" ? body.name : "");
        void navigate(next, { replace: true });
      } catch {
        // Offline or the server is restarting: the next check tries again.
      } finally {
        asking = false;
      }
    };
    const onFocus = () => void check();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };
    globalThis.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = setInterval(onFocus, SESSION_CHECK_MS);
    return () => {
      done = true;
      globalThis.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(timer);
    };
  }, [href, navigate, next]);

  return signedInAs;
};
