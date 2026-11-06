// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ChevronDown, ShieldCheck } from "lucide-react";
import { type ReactNode } from "react";

import { Menu, MenuContent, MenuTrigger } from "#ui/components/Overlays";

const button =
  "flex h-[38px] flex-none items-center gap-1.5 rounded-md border bg-surface px-3.5 font-semibold hover:bg-sunken";

/**
 * The two-button header pattern (#103), the same on staff and admin pages: Actions for the
 * everyday tasks, and, only where the person has admin tasks here, a separate Admin actions
 * button (marked with the shield and an amber edge) with its own menu. The command bar lists the
 * same two groups, from the same registrations (`CommandAction.kind`).
 */
export const HeaderActions = ({
  actions,
  actionsLabel,
  adminActions,
  adminLabel,
}: {
  /** The menu items of the everyday menu. */
  actions: ReactNode;
  actionsLabel: string;
  /** The menu items of the admin menu; none leaves the button out. */
  adminActions?: ReactNode;
  adminLabel: string;
}) => (
  <>
    <Menu>
      <MenuTrigger asChild>
        <button className={`${button} border-border-strong`} type="button">
          {actionsLabel}
          <ChevronDown aria-hidden="true" className="size-4" />
        </button>
      </MenuTrigger>
      <MenuContent align="end">{actions}</MenuContent>
    </Menu>
    {adminActions ? (
      <Menu>
        <MenuTrigger asChild>
          <button className={`${button} border-accent-line`} type="button">
            <ShieldCheck aria-hidden="true" className="size-4 text-accent-line" />
            {adminLabel}
            <ChevronDown aria-hidden="true" className="size-4" />
          </button>
        </MenuTrigger>
        <MenuContent align="end">{adminActions}</MenuContent>
      </Menu>
    ) : null}
  </>
);
