// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Command as CommandPrimitive } from "cmdk";
import { Clock, FileText, Folder, Plus, Search, Zap } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useState } from "react";

import { cn } from "#ui/lib/cn";

export interface CommandPaletteProps {
  /** A failed search, shown in place of the results (the reach error). */
  error?: ReactNode;
  groups: readonly PaletteGroup[];
  /** True while the results for the current words load. */
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cmd/Ctrl+Enter on a result: open it in a new tab. */
  onOpenInNewTab?: (item: PaletteItem) => void;
  onQueryChange: (query: string) => void;
  onSeeAll: (query: string) => void;
  onSelect: (item: PaletteItem) => void;
  open: boolean;
  query: string;
}

export interface PaletteGroup {
  heading: string;
  id: string;
  items: readonly PaletteItem[];
}

export interface PaletteItem {
  hint?: string;
  /** Folder for a category, clock for a recent item, plus for a create action, a bolt for a
   *  page action; none for a document. */
  icon?: "action" | "create" | "file" | "folder" | "recent";
  id: string;
  label: string;
  /** A page action runs instead of going anywhere (bug log 26). */
  run?: () => void;
  /** The action's keycap ("⇧R"), shown at the right edge; hidden on touch. */
  shortcut?: string;
  /** Where a result goes; an action has none. */
  to?: string;
}

/** A result that goes somewhere (every search hit); a page action has no address. */
export type PaletteLink = { to: string } & PaletteItem;

const ICONS = { action: Zap, create: Plus, file: FileText, folder: Folder, recent: Clock };

/** The label with the first match of the words underlined: "<u>Desk</u> Booking Policy". */
const Highlighted = ({ label, query }: { label: string; query: string }): ReactNode => {
  const words = query.trim();
  const at = words ? label.toLowerCase().indexOf(words.toLowerCase()) : -1;
  if (at < 0) return label;
  return (
    <>
      {label.slice(0, at)}
      <u>{label.slice(at, at + words.length)}</u>
      {label.slice(at + words.length)}
    </>
  );
};

/**
 * The command palette (H10; decision 4-components.s4): a 540 px dialog over the scrim with a
 * 52 px search row and the esc keycap, then the results grouped (POLICIES, CATEGORIES,
 * RECENT) with the matching words underlined, and "See all results for “…”" at the foot.
 * Built on the kit's cmdk `Command`; the caller does the searching (`shouldFilter` is off).
 */
export const CommandPalette = ({
  error,
  groups,
  loading,
  onOpenChange,
  onQueryChange,
  onOpenInNewTab,
  onSeeAll,
  onSelect,
  open,
  query,
}: CommandPaletteProps) => {
  const [selected, setSelected] = useState("");
  const byValue = new Map<string, PaletteItem>(
    groups.flatMap((group) =>
      group.items.map((item): [string, PaletteItem] => [`${group.id}-${item.id}`, item]),
    ),
  );
  const { t } = useTranslation("common");
  const words = query.trim();
  const empty = groups.every((group) => group.items.length === 0);
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--scrim)]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-[12vh] left-1/2 z-[var(--z-dialog)] w-[calc(100vw-32px)] max-w-[540px] -translate-x-1/2 overflow-hidden rounded-[12px] bg-surface text-base text-ink shadow-[var(--shadow-4)] focus:outline-none"
        >
          <DialogPrimitive.Title className="sr-only">{t("palette.title")}</DialogPrimitive.Title>
          <CommandPrimitive
            label={t("palette.title")}
            loop
            onKeyDown={(event) => {
              if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey) || !onOpenInNewTab) {
                return;
              }
              const item = byValue.get(selected);
              if (!item) return;
              event.preventDefault();
              onOpenInNewTab(item);
            }}
            onValueChange={setSelected}
            shouldFilter={false}
            value={selected}
          >
            <div className="flex h-[52px] items-center gap-2.5 border-b border-border px-4 text-md">
              <Search aria-hidden="true" className="size-[18px] shrink-0 text-muted" />
              <CommandPrimitive.Input
                className="min-w-0 flex-1 bg-transparent caret-primary outline-none placeholder:text-muted"
                onValueChange={onQueryChange}
                placeholder={t("palette.placeholder")}
                value={query}
              />
              <kbd className="ml-auto rounded-sm border border-border-strong px-[5px] py-px font-mono text-2xs text-muted">
                {t("palette.esc")}
              </kbd>
            </div>
            <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto p-1.5">
              {loading && empty ? (
                <CommandPrimitive.Loading>
                  <p className="px-2.5 py-3 text-muted">{t("status.loading")}</p>
                </CommandPrimitive.Loading>
              ) : null}
              {error ? <div className="p-1.5">{error}</div> : null}
              {!loading && !error && empty && words ? (
                <p className="px-2.5 py-3 text-muted">{t("palette.empty", { query: words })}</p>
              ) : null}
              {groups.map((group) =>
                group.items.length === 0 ? null : (
                  <CommandPrimitive.Group
                    className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[.06em] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase"
                    heading={group.heading}
                    key={group.id}
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon ? ICONS[item.icon] : null;
                      return (
                        <CommandPrimitive.Item
                          className="group flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 data-[selected=true]:bg-primary-soft data-[selected=true]:text-on-primary-soft"
                          key={`${group.id}-${item.id}`}
                          onSelect={() => onSelect(item)}
                          value={`${group.id}-${item.id}`}
                        >
                          {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
                          {item.icon === "folder" ? (
                            <span>
                              <Highlighted label={item.label} query={words} />
                              {item.hint ? (
                                <span className="text-xs text-muted group-data-[selected=true]:text-on-primary-soft">
                                  {" "}
                                  · {item.hint}
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            <span className="flex min-w-0 flex-col">
                              <b className="font-semibold">
                                <Highlighted label={item.label} query={words} />
                              </b>
                              {item.hint ? (
                                <span className="text-xs text-muted group-data-[selected=true]:text-on-primary-soft">
                                  {item.hint}
                                </span>
                              ) : null}
                            </span>
                          )}
                          {item.shortcut ? (
                            <kbd className="ml-auto rounded-sm border border-border-strong px-[5px] py-px font-mono text-2xs text-muted group-data-[selected=true]:text-on-primary-soft [@media(pointer:coarse)]:hidden">
                              {item.shortcut}
                            </kbd>
                          ) : null}
                        </CommandPrimitive.Item>
                      );
                    })}
                  </CommandPrimitive.Group>
                ),
              )}
              {words ? (
                <CommandPrimitive.Item
                  className={cn(
                    "mt-1 flex cursor-pointer rounded-md p-2.5 font-semibold text-primary data-[selected=true]:bg-primary-soft",
                    !empty && "rounded-t-none border-t border-border",
                  )}
                  onSelect={() => onSeeAll(words)}
                  value="see-all"
                >
                  {t("palette.seeAll", { query: words })}
                </CommandPrimitive.Item>
              ) : null}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
