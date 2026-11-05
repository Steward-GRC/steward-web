// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form } from "react-router";

/**
 * The header search (H1): a 36 px field with the ⌘K keycap. Enter opens the search page with
 * the words typed; ⌘K or Ctrl+K puts the cursor in the field. The command palette (H10)
 * replaces the plain search page later.
 */
export const SearchField = ({
  className,
  placeholder,
  shortcut = true,
  tone = "default",
}: {
  className?: string;
  placeholder?: string;
  /** Show the ⌘K keycap and listen for the shortcut. */
  shortcut?: boolean;
  /** "on-dark" for the ink admin header (H2). */
  tone?: "default" | "on-dark";
}) => {
  const { t } = useTranslation("shell");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        // Only the visible field takes the shortcut; the phone drawer's own has none.
        if (!input.current?.offsetParent && input.current?.getClientRects().length === 0) return;
        event.preventDefault();
        input.current?.focus();
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [shortcut]);

  return (
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
  );
};
