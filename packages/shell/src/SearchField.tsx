// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form } from "react-router";

import type { CreateAction } from "./createActions";

import { ShellCommandPalette } from "./ShellCommandPalette";

/** True while the person is typing in a field, where a letter shortcut must not fire. */
const typingIn = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

/**
 * The header search (H1): a 36 px field with the ⌘K keycap. Focusing it, or ⌘K / Ctrl+K,
 * opens the command palette (H10) with whatever was typed. Before the page is interactive it's
 * a plain form to the search page.
 */
export const SearchField = ({
  className,
  creates = [],
  placeholder,
  shortcut = true,
  tone = "default",
}: {
  className?: string;
  /** What the person may create from the palette ("New policy"…), by permission. */
  creates?: readonly CreateAction[];
  placeholder?: string;
  /** Show the ⌘K keycap and listen for the shortcut. */
  shortcut?: boolean;
  /** "on-dark" for the ink admin header (H2). */
  tone?: "default" | "on-dark";
}) => {
  const { t } = useTranslation("shell");
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        // Only the header's field listens (the phone drawer's has no shortcut), and the palette
        // opens even where that field is hidden, at any width.
        event.preventDefault();
        setTyped(input.current?.value ?? "");
        setOpen(true);
        return;
      }
      // Shift+C opens it on Create, as "New " typed; never while typing in a field.
      if (
        creates.length > 0 &&
        event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key.toLowerCase() === "c" &&
        !typingIn(event.target)
      ) {
        event.preventDefault();
        setTyped(t("palette.createPrefix"));
        setOpen(true);
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [creates.length, shortcut, t]);

  return (
    <>
      <Form
        action="/search"
        className={cn(
          "flex h-9 items-center gap-2 rounded-md border border-control bg-background px-2.5 text-sm text-muted focus-within:border-primary",
          className,
        )}
        method="get"
        role="search"
      >
        <Search aria-hidden="true" className="size-[15px] flex-none" />
        <input
          aria-label={t("header.search.label")}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none",
            tone === "on-dark"
              ? "text-[#f6eef4] placeholder:text-[#c9b8c7]"
              : "text-ink placeholder:text-muted",
          )}
          name="q"
          // A click, or typing, opens the palette; tabbing onto the field doesn't, so focus
          // can come back here when the palette closes without opening it again.
          onClick={(event) => {
            setTyped(event.currentTarget.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            const printable = event.key.length === 1;
            if (!printable && event.key !== "Enter" && event.key !== "ArrowDown") return;
            event.preventDefault();
            setTyped(event.currentTarget.value + (printable ? event.key : ""));
            setOpen(true);
          }}
          placeholder={placeholder ?? t("header.search.placeholder")}
          ref={input}
          type="search"
        />
        {shortcut ? (
          <kbd
            className={cn(
              "rounded-sm border px-[5px] py-px font-mono text-2xs max-xl:hidden",
              tone === "on-dark" ? "border-[#56465b]" : "border-border-strong",
            )}
          >
            {t("header.search.shortcut")}
          </kbd>
        ) : null}
      </Form>
      <ShellCommandPalette
        creates={creates}
        initialQuery={typed}
        onOpenChange={setOpen}
        open={open}
      />
    </>
  );
};
