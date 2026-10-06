// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { refusalOf } from "@steward-web/shell";
import { DocumentType, PolicyReader } from "@steward-web/ui/domain";
import {
  acknowledgePolicy,
  breakGlassReveal,
  getPolicyDetail,
} from "@steward-web/ui/domain/server";
import { data } from "react-router";

import type { Route } from "./+types/procedure";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const detail = await getPolicyDetail(DocumentType.Procedure, params.number, cookie);
  if (!detail) throw new Response("Not Found", { status: 404 });
  return data({ detail });
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent !== "acknowledge" && intent !== "breakGlass") {
    throw new Response("Bad Request", { status: 400 });
  }

  try {
    if (intent === "acknowledge") {
      const policyVersionId = String(form.get("policyVersionId") ?? "");
      await acknowledgePolicy(policyVersionId, cookie);
    } else {
      const policyId = String(form.get("policyId") ?? "");
      const reason = String(form.get("reason") ?? "");
      await breakGlassReveal(policyId, reason, cookie);
    }
    return data({ ok: true });
  } catch (error) {
    return data({ error: refusalOf(error) }, { status: 400 });
  }
};

export default function ProcedureRoute({ loaderData }: Route.ComponentProps) {
  return <PolicyReader detail={loaderData.detail} />;
}
