// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  CommandPalette,
  type Failure,
  formatShortcut,
  type PaletteGroup,
  type PaletteItem,
  type PaletteLink,
  ReachError,
  SHORTCUTS,
  useCommandActions,
} from "@steward-web/ui";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

import type { CreateAction } from "./createActions";

import { readRecent, rememberRecent } from "./commandPaletteRecent";

/** A create action answers words in its label ("New procedure" for "proc" or "new pro"). */
const matchesCreate = (label: string, words: string) =>
  label.toLowerCase().includes(words.toLowerCase());

/** Each app's `/resources/command-palette?q=` answers this: its results, grouped. */
export interface CommandPaletteResults {
  /** Set when the app couldn't reach its data; the palette shows the reach error. */
  failure?: Failure;
  groups: { id: string; items: PaletteLink[] }[];
}

export const COMMAND_PALETTE_PATH = "/resources/command-palette";

const SEARCH_DELAY_MS = 120;

/**
 * The palette (H10) with real data: the app's own search over its policies, procedures and
 * categories (and, in admin, templates and groups), and "Recent" when nothing is typed.
 */
export const ShellCommandPalette = ({
  creates = [],
  initialQuery,
  onOpenChange,
  open,
}: {
  /** What the person may create ("New policy"…), listed under Create. */
  creates?: readonly CreateAction[];
  initialQuery: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const { t } = useTranslation("shell");
  const navigate = useNavigate();
  const fetcher = useFetcher<CommandPaletteResults>();
  const { load } = fetcher;
  const pageActions = useCommandActions();
  const [query, setQuery] = useState(initialQuery);
  const [recent, setRecent] = useState<PaletteItem[]>([]);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setQuery(initialQuery);
  }

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  const words = query.trim();
  const search = () =>
    void load(`${COMMAND_PALETTE_PATH}?${new URLSearchParams({ q: words }).toString()}`);
  const failure = words ? fetcher.data?.failure : undefined;
  useEffect(() => {
    if (!open || !words) return;
    const timer = setTimeout(
      () => void load(`${COMMAND_PALETTE_PATH}?${new URLSearchParams({ q: words }).toString()}`),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [load, open, words]);

  // Create, as Brigade's command bar ranks it: what the person may create, narrowed to the
  // words ("proc" keeps New procedure). It comes first with nothing typed, and after the
  // search's own results once something is.
  const createGroup: PaletteGroup = {
    heading: t("palette.groups.create"),
    id: "create",
    items: creates
      .map((action) => ({
        icon: "create" as const,
        id: `create:${action.id}`,
        label: t(action.label),
        to: action.to,
      }))
      .filter((item) => !words || matchesCreate(item.label, words)),
  };
  // This page's actions (bug log 26) come before everything, narrowed by the words like Create.
  const actionsGroup: PaletteGroup = {
    heading: t("palette.groups.actions"),
    id: "actions",
    items: pageActions
      .filter((action) => !words || matchesCreate(action.label, words))
      .map((action) => ({
        icon: "action" as const,
        id: `action:${action.id}`,
        label: action.label,
        run: action.run,
        shortcut: action.shortcut ? formatShortcut(SHORTCUTS[action.shortcut].keys) : undefined,
      })),
  };
  const groups: PaletteGroup[] = words
    ? [
        actionsGroup,
        ...(fetcher.data?.groups ?? []).map((group) => ({
          heading: t(`palette.groups.${group.id}`, { defaultValue: group.id }),
          id: group.id,
          items: group.items,
        })),
        createGroup,
      ]
    : [
        actionsGroup,
        createGroup,
        {
          heading: t("palette.groups.recent"),
          id: "recent",
          items: recent.map((item) => ({ ...item, icon: "recent" as const })),
        },
      ];

  const go = (to: string) => {
    onOpenChange(false);
    void navigate(to);
  };

  return (
    <CommandPalette
      error={
        failure ? (
          <ReachError
            action={t("palette.action")}
            failure={failure}
            onRetry={search}
            retrying={fetcher.state !== "idle"}
          />
        ) : undefined
      }
      groups={groups}
      loading={Boolean(words) && fetcher.state !== "idle"}
      onOpenChange={onOpenChange}
      onOpenInNewTab={(item) => {
        onOpenChange(false);
        if (item.to) globalThis.open(item.to, "_blank", "noopener");
      }}
      onQueryChange={setQuery}
      onSeeAll={(text) => go(`/search?${new URLSearchParams({ q: text }).toString()}`)}
      onSelect={(item) => {
        if (item.run) {
          // Close first and run on the next tick, so a dialog the action opens doesn't fight
          // the palette's own dialog for focus as it closes.
          onOpenChange(false);
          const { run } = item;
          setTimeout(run, 0);
          return;
        }
        if (!item.to) return;
        if (item.icon !== "create") rememberRecent(item);
        go(item.to);
      }}
      open={open}
      query={query}
    />
  );
};
