// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { X } from "lucide-react";
import { type ChangeEvent, type ComponentProps, forwardRef, useRef, useState } from "react";

import { Input } from "#ui/components/Input";
import { cn } from "#ui/lib/cn";

/** Empties an input and tells React's `onChange` about it, whoever controls the box. */
export const clearInput = (input: HTMLInputElement) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, "");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
};

/**
 * The clear button (#107) for a search box that draws its own frame: the caller shows it only
 * while the box has text.
 */
export const ClearSearchButton = ({
  className,
  input,
}: {
  className?: string;
  input: { current: HTMLInputElement | null };
}) => {
  const { t } = useTranslation("common");
  return (
    <button
      aria-label={t("search.clear")}
      className={cn(
        "flex size-6 flex-none items-center justify-center rounded-sm text-muted hover:text-ink",
        className,
      )}
      onClick={() => input.current && clearInput(input.current)}
      type="button"
    >
      <X aria-hidden="true" className="size-4" />
    </button>
  );
};

/**
 * The one search box (#107): an input with a clear button (an X, labelled "Clear search") once
 * it has text. Clicking it empties the box, returns focus and resets the results through the
 * box's own `onChange`; Escape does the same, and only while there is text, so an empty box still
 * lets Escape close the dialog around it. Every list, table and typeahead uses it.
 */
export const SearchInput = forwardRef<
  HTMLInputElement,
  { wrapperClassName?: string } & ComponentProps<typeof Input>
>(
  (
    {
      className,
      defaultValue,
      onChange,
      onKeyDown,
      type = "search",
      value,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const own = useRef<HTMLInputElement | null>(null);
    const [typed, setTyped] = useState(String(defaultValue ?? ""));
    const text = value === undefined ? typed : String(value);

    const clear = () => {
      if (own.current) clearInput(own.current);
    };

    return (
      <div className={cn("relative flex items-center", wrapperClassName)}>
        <Input
          className={cn(
            "pr-8 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none",
            className,
          )}
          defaultValue={defaultValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setTyped(event.target.value);
            onChange?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === "Escape" && text !== "" && !event.defaultPrevented) {
              event.preventDefault();
              event.stopPropagation();
              clear();
            }
          }}
          ref={(node) => {
            own.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          type={type}
          value={value}
          {...props}
        />
        {text === "" ? null : <ClearSearchButton className="absolute right-1.5" input={own} />}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
