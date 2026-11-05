// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  CommandPalette,
  type Failure,
  type PaletteGroup,
  type PaletteItem,
  ReachError,
} from "@steward-web/ui";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

import { readRecent, rememberRecent } from "./commandPaletteRecent";

/** Each app's `/resources/command-palette?q=` answers this: its results, grouped. */
export interface CommandPaletteResults {
  /** Set when the app couldn't reach its data; the palette shows the reach error. */
  failure?: Failure;
  groups: { id: string; items: PaletteItem[] }[];
}

export const COMMAND_PALETTE_PATH = "/resources/command-palette";

const SEARCH_DELAY_MS = 120;

/**
 * The palette (H10) with real data: the app's own search over its policies, procedures and
 * categories (and, in admin, templates and groups), and "Recent" when nothing is typed.
 */
export const ShellCommandPalette = ({
  initialQuery,
  onOpenChange,
  open,
}: {
  initialQuery: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const { t } = useTranslation("shell");
  const navigate = useNavigate();
  const fetcher = useFetcher<CommandPaletteResults>();
  const { load } = fetcher;
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

  const groups: PaletteGroup[] = words
    ? (fetcher.data?.groups ?? []).map((group) => ({
        heading: t(`palette.groups.${group.id}`, { defaultValue: group.id }),
        id: group.id,
        items: group.items,
      }))
    : [
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
      onQueryChange={setQuery}
      onSeeAll={(text) => go(`/search?${new URLSearchParams({ q: text }).toString()}`)}
      onSelect={(item) => {
        rememberRecent(item);
        go(item.to);
      }}
      open={open}
      query={query}
    />
  );
};
