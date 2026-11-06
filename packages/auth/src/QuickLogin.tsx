// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Banner, Button } from "@steward-web/ui";
import { Form } from "react-router";

import type { QuickLoginUser } from "./signInState";

import { DEV_QUICK_LOGIN_MARKER } from "./quickLoginMarker";

export interface QuickLoginProps {
  next: string;
  users: readonly QuickLoginUser[];
}

/**
 * The dev quick login under the sign-in form: one click signs in as a seeded test account,
 * through the same gateway login as the form (so a second factor is still asked for). Every
 * account gets its own submit button in one form, so picking one is a single click, not a
 * select-then-submit. Renders nothing until the server lists accounts. Aliased in as
 * `@steward-web/dev-quick-login` only for builds that allow it; see `NoQuickLogin.tsx`.
 */
export const QuickLogin = ({ next, users }: QuickLoginProps) => {
  const { t } = useTranslation("auth");
  if (users.length === 0) return null;

  return (
    <div
      className="grid gap-3 rounded-md border border-dashed border-border-strong p-4"
      data-dev-quick-login={DEV_QUICK_LOGIN_MARKER}
    >
      <Banner title={t("quickLogin.bannerTitle")} tone="warn" />
      <Form className="grid grid-cols-2 gap-2" method="post">
        <input name="intent" type="hidden" value="dev-quick-login" />
        <input name="next" type="hidden" value={next} />
        {users.map((user) => (
          <Button
            key={user.username}
            name="username"
            title={user.note}
            type="submit"
            value={user.username}
            variant="secondary"
          >
            {user.label}
          </Button>
        ))}
      </Form>
    </div>
  );
};

export interface QuickLoginBarProps {
  /** The root loader's own check that the dev quick login has accounts to offer. */
  enabled: boolean;
}

/**
 * The "dev login" strip across the very top of every page while the dev quick login is on, in
 * the same 28 px hatch as the test-environment banner, so a build carrying it is never mistaken
 * for a production one away from the sign-in page. The shells place it above everything (their
 * `devLogin` slot). Aliased in alongside `QuickLogin`; see `NoQuickLogin.tsx`.
 */
export const QuickLoginBar = ({ enabled }: QuickLoginBarProps) => {
  const { t } = useTranslation("auth");
  if (!enabled) return null;
  return (
    <div
      className="env-banner flex h-7 flex-none items-center justify-center gap-2.5 text-xs font-medium"
      data-dev-quick-login-bar={DEV_QUICK_LOGIN_MARKER}
      data-testid="dev-login-bar"
    >
      <span className="rounded-[3px] bg-accent-fill px-[7px] py-px font-mono text-[11px] font-semibold tracking-[.06em] text-on-accent">
        DEV
      </span>
      {t("quickLogin.bannerTitle")}
    </div>
  );
};
