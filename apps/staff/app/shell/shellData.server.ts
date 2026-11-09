// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Category } from "@steward-web/api-client";

import { can, type Identity } from "@steward-web/auth";
import edge from "@steward-web/edge.server";
import { shellConfigFromEnvironment } from "@steward-web/shell/server";
import { listCategories } from "@steward-web/ui/domain/server";

import { listPendingTasks } from "../approvals/approvals.server";
import { reportingEnabled } from "../reporting/enabled.server";

/**
 * What the staff shell (H1) needs beyond the identity: the install settings, the reporting
 * switch, the category tree for Browse by category, and the counts for the Approvals and To
 * acknowledge chips, the acting-as session (H9) and whether to nudge for a stronger second
 * factor (H8). Each read is asked only of someone who can use it, and a failed read leaves
 * that part of the shell empty rather than failing the page.
 */
const STRONG_FACTORS = new Set(["passkey", "totp"]);

export const staffShellData = async (request: Request, identity: Identity) => {
  const signedIn = identity.id !== "";
  const cookie = request.headers.get("cookie") ?? undefined;
  const [categories, approvals, acknowledge, impersonation, factors] = await Promise.all([
    signedIn && can(identity, "policy.read")
      ? listCategories(cookie).catch((): readonly Category[] => [])
      : Promise.resolve<readonly Category[]>([]),
    // Asked of everyone who can read: a seat in a workflow does not need the approver role, and
    // the tasks are the signed-in person's own (bug log 257).
    signedIn && can(identity, "policy.read")
      ? listPendingTasks(request).then(
          (tasks) => tasks.length,
          () => null,
        )
      : Promise.resolve(null),
    signedIn && can(identity, "policy.read")
      ? edge.myObligations(cookie).then(
          (obligations) => obligations.length,
          () => null,
        )
      : Promise.resolve(null),
    // The acting-as banner (H9) and the second-factor nudge (H8). A failed read shows neither.
    signedIn ? edge.impersonationStatus(cookie).catch(() => null) : Promise.resolve(null),
    signedIn ? edge.myFactors(cookie).catch(() => null) : Promise.resolve(null),
  ]);
  return {
    categories,
    config: shellConfigFromEnvironment(),
    counts: {
      ...(acknowledge === null ? {} : { acknowledge }),
      // Without the approver role the item shows only while something waits on the person.
      ...(approvals === null || (approvals === 0 && !can(identity, "policy.approve"))
        ? {}
        : { approvals }),
    },
    impersonation: impersonation
      ? { expiresAt: impersonation.expiresAt, targetName: impersonation.targetName }
      : null,
    reporting: reportingEnabled(),
    // Only email codes: nudge towards an authenticator app or a passkey (H8).
    secondFactorNudge:
      Array.isArray(factors) && !factors.some((factor) => STRONG_FACTORS.has(factor.kind)),
  };
};
