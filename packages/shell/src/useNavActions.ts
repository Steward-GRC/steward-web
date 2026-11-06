// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A page's way to offer "go there" actions to the command bar (bug log 26): the shared
// useRegisterCommandActions with the navigation filled in, so a page lists addresses and not
// callbacks. The registry drops an action with allowed false.
import { useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { type ShortcutId, useRegisterCommandActions } from "@steward-web/ui";
import { useNavigate } from "react-router";

import { adminCreates, staffCreates } from "./createActions";

export interface NavAction {
  /** False when the person may not take it. Default true. */
  allowed?: boolean;
  id: string;
  /** Already worded for the person. */
  label: string;
  shortcut?: ShortcutId;
  to: string;
}

export const useRegisterNavActions = (actions: readonly NavAction[]) => {
  const navigate = useNavigate();
  useRegisterCommandActions(
    actions.map(({ to, ...action }) => ({ ...action, run: () => void navigate(to) })),
  );
};

/**
 * Offers the creates a page is about (New policy on the drafts list, New group on the groups
 * list), each only when the person's permissions allow it: the same lists the shell's create
 * menu uses (`staffCreates`, `adminCreates`), so a permission is decided in one place. The
 * first one listed also runs on the create shortcut.
 */
export const useRegisterCreateActions = (app: "admin" | "staff", ids: readonly string[]) => {
  const { t } = useTranslation();
  const identity = useIdentity();
  const can = (permission: string) =>
    (app === "admin" && identity.isSiteAdmin) || identity.permissions.has(permission);
  const offered = (app === "admin" ? adminCreates(can) : staffCreates(can)).filter((create) =>
    ids.includes(create.id),
  );
  useRegisterNavActions(
    offered.map((create, index) => ({
      id: `create-${create.id}`,
      label: t(create.label),
      shortcut: index === 0 ? "create" : undefined,
      to: create.to,
    })),
  );
};
