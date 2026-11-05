// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ChevronDown, PanelLeft } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";

import { cn } from "#ui/lib/cn";

export interface OutlineCardProps {
  /** The links under the list: "History & approvals", "Print / Export". */
  footer?: ReactNode;
  items: readonly OutlineItem[];
  /** Told when the card collapses to its side tab, so the page can widen the document. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export interface OutlineItem {
  /** The heading's element id, which the link jumps to. */
  id: string;
  label: string;
  /** 2 for a sub-section ("3.1 …"): indented, unnumbered and left out of the count. */
  level?: 1 | 2;
  /** The mono number in the left column: "1", "2", "A". */
  number?: string;
}

/** Follows the heading nearest the top of the viewport as the reader scrolls. */
const useActiveSection = (ids: readonly string[]) => {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.set(id, entry.boundingClientRect.top);
          else visible.delete(id);
        }
        const top = [...visible.entries()].toSorted((a, b) => a[1] - b[1])[0];
        if (top) setActive(top[0]);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const id of key.split("|")) {
      const element = id ? document.querySelector(`[id="${CSS.escape(id)}"]`) : null;
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);
  return active;
};

/**
 * The reader's "On this page" outline (U7): a sticky 264 px card that tracks the section being
 * read, with "1 of 5" and a progress bar, collapsible to a 44 px vertical side tab so the
 * document can go full width. Below the large breakpoint it's an "On this page" menu (U7m).
 */
export const OutlineCard = ({ footer, items, onCollapsedChange }: OutlineCardProps) => {
  const { t } = useTranslation("policy");
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navId = useId();
  const active = useActiveSection(items.map((item) => item.id));

  const top = items.filter((item) => item.level !== 2);
  const activeIndex = items.findIndex((item) => item.id === active);
  const owner = items.slice(0, Math.max(activeIndex, 0) + 1).findLast((item) => item.level !== 2);
  const current = Math.max(top.indexOf(owner ?? top[0]!), 0) + 1;
  const total = top.length;
  const progress = total > 0 ? (current / total) * 100 : 0;

  const collapse = (next: boolean) => {
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  if (collapsed) {
    return (
      <button
        aria-expanded={false}
        aria-label={t("reader.outline.expand", { title: t("reader.outline.title") })}
        className="sticky top-4 hidden min-h-[220px] w-11 flex-col items-center gap-3 rounded-lg bg-surface py-3 text-ink shadow-[inset_0_0_0_1px_var(--border),var(--shadow-1)] lg:flex"
        onClick={() => collapse(false)}
        type="button"
      >
        <PanelLeft aria-hidden="true" className="size-4 text-muted" />
        <span className="text-base font-semibold tracking-[.02em] [writing-mode:vertical-rl]">
          {t("reader.outline.title")}
        </span>
        <span
          aria-hidden="true"
          className="relative min-h-10 w-[3px] flex-1 overflow-hidden rounded-[2px] bg-sunken"
        >
          <span
            className="absolute inset-x-0 top-0 bg-primary"
            style={{ height: `${progress}%` }}
          />
        </span>
        <span className="font-mono text-2xs font-medium text-muted">
          {t("reader.outline.positionShort", { current, total })}
        </span>
      </button>
    );
  }

  return (
    <aside className="lg:sticky lg:top-4">
      <button
        aria-controls={navId}
        aria-expanded={menuOpen}
        className="flex h-11 w-full items-center justify-between rounded-[8px] bg-surface px-3.5 text-base font-medium shadow-[inset_0_0_0_1px_var(--border-strong)] lg:hidden"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        {t("reader.outline.title")}
        <ChevronDown aria-hidden="true" className="size-4" />
      </button>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-surface text-[15px] leading-[1.35] shadow-[var(--shadow-1)] max-lg:mt-2",
          !menuOpen && "max-lg:hidden",
        )}
      >
        <div className="hidden items-center justify-between border-b border-border px-3.5 py-3 lg:flex">
          <span className="text-base font-semibold">{t("reader.outline.title")}</span>
          <span className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">
              {t("reader.outline.position", { current, total })}
            </span>
            <button
              aria-expanded
              aria-label={t("reader.outline.collapse")}
              className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-sunken"
              onClick={() => collapse(true)}
              title={t("reader.outline.collapse")}
              type="button"
            >
              <PanelLeft aria-hidden="true" className="size-4" />
            </button>
          </span>
        </div>
        <div aria-hidden="true" className="hidden h-[3px] bg-sunken lg:block">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <nav
          aria-label={t("reader.outline.title")}
          className="flex flex-col gap-px px-1.5 py-2"
          id={navId}
        >
          {items.map((item) => {
            const isActive = item.id === active;
            const sub = item.level === 2;
            return (
              <a
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "grid items-baseline gap-1 rounded-md px-2.5 py-[7px] no-underline hover:bg-sunken",
                  sub
                    ? "grid-cols-1 pl-[38px] text-base text-muted"
                    : "grid-cols-[28px_1fr] text-ink",
                  isActive &&
                    "bg-primary-soft font-semibold text-on-primary-soft hover:bg-primary-soft",
                )}
                data-level={sub ? 2 : 1}
                href={`#${item.id}`}
                key={item.id}
                onClick={() => setMenuOpen(false)}
              >
                {sub ? null : (
                  <>
                    <span
                      className={cn(
                        "font-mono text-xs font-medium",
                        isActive ? "text-on-primary-soft" : "text-muted",
                      )}
                    >
                      {item.number}
                    </span>{" "}
                  </>
                )}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        {footer ? (
          <div className="flex flex-col gap-2 border-t border-border px-3.5 py-2.5 text-base font-medium [&_a]:flex [&_a]:items-center [&_a]:gap-2 [&_a]:no-underline">
            {footer}
          </div>
        ) : null}
      </div>
    </aside>
  );
};
