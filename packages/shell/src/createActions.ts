// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What the command bar (H10) can create, by app and by permission. Each opens the type's create
// page; where that page isn't built yet, its address answers Coming soon until it is.
import { PERMISSIONS } from "@steward-web/auth";

import { newDraftPath } from "./newDraftPath";

export interface CreateAction {
  id: string;
  /** The i18n key of "New policy" and the like. */
  label: string;
  to: string;
}

type Can = (permission: string) => boolean;

const create = (id: string, to: string): CreateAction => ({
  id,
  label: `shell:create.${id}`,
  to,
});

/** Staff: an author creates policies and procedures, from scratch or from a template. */
export const staffCreates = (can: Can): CreateAction[] =>
  can(PERMISSIONS.PolicyAuthor)
    ? [
        create("policy", newDraftPath("POLICY")),
        create("procedure", newDraftPath("PROCEDURE")),
        create("fromTemplate", "/templates"),
      ]
    : [];

/** Admin: each structure, people and sign-in type the person may manage. */
export const adminCreates = (can: Can): CreateAction[] => [
  ...(can(PERMISSIONS.GroupManage) ? [create("category", "/groups/new")] : []),
  // No New user: people arrive through sign-in (the users screen, #65, has no create).
  ...(can(PERMISSIONS.UserManage) ? [create("group", "/platform-groups")] : []),
  ...(can(PERMISSIONS.GroupManage)
    ? [create("template", "/templates/new"), create("workflow", "/workflows/new")]
    : []),
  ...(can(PERMISSIONS.SettingsManage) ? [create("organisation", "/organisations/new")] : []),
  ...(can(PERMISSIONS.GroupManage) ? [create("magicLink", "/magic-links")] : []),
];
