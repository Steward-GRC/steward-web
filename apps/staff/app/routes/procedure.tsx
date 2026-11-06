// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PERMISSIONS, useIdentity } from "@steward-web/auth";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { refusalOf } from "@steward-web/shell";
import { DocumentType, PolicyReader } from "@steward-web/ui/domain";
import {
  acknowledgePolicy,
  breakGlassReveal,
  getPolicyDetail,
  recordPolicyPrint,
} from "@steward-web/ui/domain/server";
import { data, useFetcher, useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../root";
import type { Route } from "./+types/procedure";

import { editActionOf } from "../authoring/editAction";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const detail = await getPolicyDetail(DocumentType.Procedure, params.number, cookie);
  if (!detail) throw data({ kind: "procedure", number: params.number }, { status: 404 });
  return data({ detail });
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent !== "acknowledge" && intent !== "breakGlass" && intent !== "recordExport") {
    throw new Response("Bad Request", { status: 400 });
  }

  try {
    if (intent === "acknowledge") {
      const policyVersionId = String(form.get("policyVersionId") ?? "");
      await acknowledgePolicy(policyVersionId, cookie);
      return data({ ok: true });
    }
    if (intent === "recordExport") {
      // The gateway knows the policy's sensitivity and the caller; this only says it was printed.
      await recordPolicyPrint(
        String(form.get("policyId") ?? ""),
        form.get("includeHistory") === "true",
        cookie,
      );
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

export default function ProcedureRoute({ loaderData }: Route.ComponentProps) {
  const identity = useIdentity();
  // The organisation's name heads every printed page (R1).
  const organisation = useRouteLoaderData<typeof rootLoader>("root")?.shell.config.organisation;
  const exports = useFetcher();
  return (
    <PolicyReader
      detail={loaderData.detail}
      editAction={editActionOf(
        loaderData.detail,
        identity.permissions.has(PERMISSIONS.PolicyAuthor),
      )}
      onPrint={({ includeHistory }) =>
        void exports.submit(
          {
            includeHistory: String(includeHistory),
            intent: "recordExport",
            policyId: loaderData.detail.id,
          },
          { method: "post" },
        )
      }
      organisation={organisation}
      viewerName={identity.name || undefined}
    />
  );
}
