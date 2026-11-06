// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Tabs as TabsPrimitive } from "radix-ui";
import { type ComponentProps } from "react";
import { NavLink, type NavLinkProps } from "react-router";

import { CountBadge } from "#ui/components/Badges";
import { cn } from "#ui/lib/cn";

/**
 * The one tab strip every page uses (reader, approval view, profile, admin lists). It holds the
 * look and the rules so a fix lands everywhere at once:
 * - the tabs share one width, whatever their labels;
 * - the strip sits on the white surface, and the active tab has a 3px amber underline that eases
 *   in as the person's tab transition setting says (None, Current or Smooth; not under reduced
 *   motion);
 * - a tab can carry an amber count badge, and a tab with nothing to show is left out;
 * - a strip wider than its box scrolls sideways, never up and down.
 */
const stripClass =
  "grid auto-cols-fr grid-flow-col gap-1 overflow-x-auto overflow-y-hidden border-b border-border-strong bg-surface";

const tabClass =
  "stw-tab -mb-px rounded-none border-0 bg-transparent px-3 py-2.5 text-base font-medium whitespace-nowrap text-muted shadow-none transition-shadow duration-200 hover:text-ink motion-reduce:transition-none data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-[inset_0_-3px_var(--accent)]";

/** The same look for a tab that is a link to its own address (the profile's tabs). */
const linkClass = (active: boolean) =>
  cn(
    "stw-tab -mb-px px-3 py-2.5 text-center text-base font-medium whitespace-nowrap shadow-none transition-shadow duration-200 motion-reduce:transition-none",
    active
      ? "font-semibold text-primary shadow-[inset_0_-3px_var(--accent)]"
      : "text-muted hover:text-ink",
  );

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({
  className,
  stretch = false,
  ...props
}: {
  /** Fill the width of the box; otherwise the strip is only as wide as its tabs. */
  stretch?: boolean;
} & ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(stripClass, stretch ? "w-full" : "w-fit max-w-full", className)}
    {...props}
  />
);

export const TabsTrigger = ({
  children,
  className,
  count,
  empty = false,
  ...props
}: {
  /** An amber count badge after the label. */
  count?: number;
  /** Nothing to show here: the tab isn't drawn. */
  empty?: boolean;
} & ComponentProps<typeof TabsPrimitive.Trigger>) =>
  empty ? null : (
    <TabsPrimitive.Trigger className={cn(tabClass, className)} {...props}>
      {children}
      {count === undefined ? null : (
        <>
          {" "}
          <CountBadge>{count}</CountBadge>
        </>
      )}
    </TabsPrimitive.Trigger>
  );

export const TabsContent = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content className={cn("pt-4", className)} {...props} />
);

/** A strip of links for tabs that each have their own address; pair it with TabLink. */
export const TabNav = ({ className, ...props }: ComponentProps<"nav">) => (
  <nav className={cn(stripClass, "w-full", className)} {...props} />
);

export const TabLink = ({
  className,
  ...props
}: { className?: string } & Omit<NavLinkProps, "className">) => (
  <NavLink className={({ isActive }) => cn(linkClass(isActive), className)} {...props} />
);
