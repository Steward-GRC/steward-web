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
 * acknowledge chips. Each read is asked only of someone who can use it, and a failed read leaves
 * that part of the shell empty rather than failing the page.
 */
export const staffShellData = async (request: Request, identity: Identity) => {
  const signedIn = identity.id !== "";
  const cookie = request.headers.get("cookie") ?? undefined;
  const [categories, approvals, acknowledge] = await Promise.all([
    signedIn && can(identity, "policy.read")
      ? listCategories(cookie).catch((): readonly Category[] => [])
      : Promise.resolve<readonly Category[]>([]),
    signedIn && can(identity, "policy.approve")
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
  ]);
  return {
    categories,
    config: shellConfigFromEnvironment(),
    counts: {
      ...(acknowledge === null ? {} : { acknowledge }),
      ...(approvals === null ? {} : { approvals }),
    },
    reporting: reportingEnabled(),
  };
};
