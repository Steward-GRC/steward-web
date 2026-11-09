// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Badge, Select } from "@steward-web/ui";
import { useSubmit } from "react-router";

import type { QuickLoginUser } from "./signInState";

import { DEV_QUICK_LOGIN_MARKER } from "./quickLoginMarker";

export interface QuickLoginProps {
  next: string;
  users: readonly QuickLoginUser[];
}

/**
 * The dev quick login under the sign-in form, the way Sneakers has it: a "Dev quick login" label
 * with a DEV badge and one dropdown of the seeded accounts, where a pick signs in at once
 * through the same gateway login as the form (so a second factor is still asked for). Renders
 * nothing until the server lists accounts. The staff and admin apps share it, aliased in as
 * `@steward-web/dev-quick-login` only for builds that allow it; see `NoQuickLogin.tsx`.
 */
export const QuickLogin = ({ next, users }: QuickLoginProps) => {
  const { t } = useTranslation("auth");
  const submit = useSubmit();
  if (users.length === 0) return null;

  return (
    <div
      className="grid gap-1.5 rounded-md border border-dashed border-border-strong p-4"
      data-dev-quick-login={DEV_QUICK_LOGIN_MARKER}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {t("quickLogin.label")}
        <Badge shape="tag" tone="warn">
          DEV
        </Badge>
      </div>
      <Select
        aria-label={t("quickLogin.label")}
        onValueChange={(username) =>
          void submit({ intent: "dev-quick-login", next, username }, { method: "post" })
        }
        options={users.map((user) => ({
          label: user.note ? `${user.label} · ${user.note}` : user.label,
          value: user.username,
        }))}
        placeholder={t("quickLogin.placeholder")}
      />
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
