// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A page's way to offer "go there" actions to the command bar (bug log 26): the shared
// useRegisterCommandActions with the navigation filled in, so a page lists addresses and not
// callbacks. The registry drops an action with allowed false.
import { type ShortcutId, useRegisterCommandActions } from "@steward-web/ui";
import { useNavigate } from "react-router";

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
