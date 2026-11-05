// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ProfileName } from "@steward-web/auth";
import { requireIdentityFromRequest, updateMyProfile } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Card, CardBody, CardHeader, CardTitle, ThemeSwitch } from "@steward-web/ui";
import { data } from "react-router";

import type { Route } from "./+types/profile";

export const loader = ({ request }: Route.LoaderArgs) => requireIdentityFromRequest(request);

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  const form = await request.formData();
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();

  try {
    await updateMyProfile(request, { firstName, lastName });
    return data({ error: undefined, saved: true });
  } catch (error) {
    return data({ error: refusalOf(error), saved: false }, { status: 400 });
  }
};

/** The per-person theme choice (decision 3-colour-type-tokens.s3), saved to this browser. */
const ThemeCard = () => {
  const { t } = useTranslation("settings");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("theme.title")}</CardTitle>
      </CardHeader>
      <CardBody className="grid gap-4">
        <p className="text-sm text-muted">{t("theme.description")}</p>
        <ThemeSwitch />
      </CardBody>
    </Card>
  );
};

export default function Profile({ actionData }: Route.ComponentProps) {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6 p-6">
      <ProfileName error={actionData?.error} saved={actionData?.saved} />
      <ThemeCard />
    </div>
  );
}
