// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ProfileName } from "@steward-web/auth";
import { requireIdentityFromRequest, updateMyProfile } from "@steward-web/auth/server";
import { refusalOf } from "@steward-web/shell";
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

export default function Profile({ actionData }: Route.ComponentProps) {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <ProfileName error={actionData?.error} saved={actionData?.saved} />
    </div>
  );
}
