// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { can, type Identity, PERMISSIONS } from "@steward-web/auth";
import { reportingEnabled, shellConfigFromEnvironment } from "@steward-web/shell/server";

import { fetchAllGroups } from "../groups/groups.server";

export interface ShellCategory {
  id: string;
  name: string;
  parentId: null | string;
}

/**
 * What the admin shell (H2) needs beyond the identity: the install settings, the reporting
 * switch for the Compliance group, and the category tree for the Categories panel. The tree
 * is read only for someone who manages categories or views their access (a template admin,
 * A5), and a failed read leaves the panel's tree empty rather than failing the page.
 */
export const adminShellData = async (request: Request, identity: Identity) => {
  const cookie = request.headers.get("cookie") ?? undefined;
  const categories: ShellCategory[] =
    identity.id !== "" &&
    (can(identity, PERMISSIONS.GroupManage) || can(identity, PERMISSIONS.TemplateManage))
      ? await fetchAllGroups(cookie).then(
          (groups) =>
            groups.map(({ id, name, parentId }) => ({ id, name, parentId: parentId ?? null })),
          (): ShellCategory[] => [],
        )
      : [];
  return {
    categories,
    config: shellConfigFromEnvironment(),
    reporting: reportingEnabled(),
  };
};
