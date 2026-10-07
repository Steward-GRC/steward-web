// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Button, Field } from "@steward-web/ui";
import { Form } from "react-router";

import type { QuickLoginUser } from "./signInState";

import { DEV_QUICK_LOGIN_MARKER } from "./quickLoginMarker";

export interface QuickLoginProps {
  next: string;
  users: readonly QuickLoginUser[];
}

/**
 * The dev quick login under the sign-in form: pick a local account and sign in as it, through
 * the same gateway login as the form (so a second factor is still asked for). Renders nothing
 * until the server lists accounts. Aliased in as `@steward-web/dev-quick-login` only for builds
 * that allow it; see `NoQuickLogin.tsx`.
 */
export const QuickLogin = ({ next, users }: QuickLoginProps) => {
  const { t } = useTranslation("auth");
  if (users.length === 0) return null;

  return (
    <Form
      className="grid gap-2 rounded-md border border-dashed border-border-strong p-4"
      data-dev-quick-login={DEV_QUICK_LOGIN_MARKER}
      method="post"
    >
      <input name="intent" type="hidden" value="dev-quick-login" />
      <input name="next" type="hidden" value={next} />
      <Field label={t("quickLogin.label")}>
        <select
          className="h-9 rounded-md border border-border-strong bg-surface px-2"
          name="username"
        >
          {users.map((user) => (
            <option key={user.username} value={user.username}>
              {user.note ? `${user.label} (${user.note})` : user.label}
            </option>
          ))}
        </select>
      </Field>
      <Button type="submit" variant="secondary">
        {t("quickLogin.action")}
      </Button>
    </Form>
  );
};
