// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useIdentity } from "@steward-web/auth";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { refusalOf } from "@steward-web/shell";
import { shellConfigFromEnvironment } from "@steward-web/shell/server";
import { DocumentType, Sensitivity } from "@steward-web/ui/domain";
import {
  acknowledgePolicy,
  breakGlassReveal,
  getPolicyDetail,
} from "@steward-web/ui/domain/server";
import { data, type ShouldRevalidateFunctionArgs, useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../root";
import type { Route } from "./+types/policy";

import { AdminPolicyReader } from "../policies/AdminPolicyReader";
import { type GovernanceResult } from "../policies/governance";
import { runGovernance } from "../policies/governance.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const detail = await getPolicyDetail(DocumentType.Policy, params.number, cookie);
  if (!detail) throw data({ kind: "policy", number: params.number }, { status: 404 });
  return data({ detail });
};

/**
 * After a governance action only a new author changes what the page shows. Retire, delete and
 * move take the document away from this number (the dialog moves on), and an export or a link
 * changes nothing on the page.
 */
export const shouldRevalidate = ({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) => {
  const result = actionResult as Partial<GovernanceResult> | undefined;
  if (result?.intent && result.intent !== "changeAuthor") return false;
  return defaultShouldRevalidate;
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent !== "acknowledge" && intent !== "breakGlass") {
    // The governance actions (A11) act on the policy this page shows, read here, not on ids
    // from the form.
    const detail = await getPolicyDetail(DocumentType.Policy, params.number, cookie);
    if (!detail) throw data({ kind: "policy", number: params.number }, { status: 404 });
    return data(
      await runGovernance({
        document: {
          currentVersionId: detail.currentVersionId,
          id: detail.id,
          sensitive: detail.sensitivity === Sensitivity.Sensitive,
        },
        form,
        request,
        staffUrl: shellConfigFromEnvironment().staffUrl,
      }),
    );
  }

  try {
    if (intent === "acknowledge") {
      const policyVersionId = String(form.get("policyVersionId") ?? "");
      await acknowledgePolicy(policyVersionId, cookie);
      return data({ ok: true });
    }
    const policyId = String(form.get("policyId") ?? "");
    const reason = String(form.get("reason") ?? "");
    // When the grant ends, so the reader can count down to it (U9r).
    const { grantedUntil } = await breakGlassReveal(policyId, reason, cookie);
    return data({ grantedUntil, ok: true });
  } catch (error) {
    return data({ error: refusalOf(error) }, { status: 400 });
  }
};

export default function PolicyRoute({ loaderData }: Route.ComponentProps) {
  const identity = useIdentity();
  // The organisation's name heads every printed page (R1).
  const organisation = useRouteLoaderData<typeof rootLoader>("root")?.shell.config.organisation;
  return (
    <AdminPolicyReader
      detail={loaderData.detail}
      isSiteAdmin={identity.isSiteAdmin}
      organisation={organisation}
      viewerName={identity.name || undefined}
    />
  );
}
