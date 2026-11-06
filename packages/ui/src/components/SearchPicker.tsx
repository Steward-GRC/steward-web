// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { SearchInput } from "#ui/components/SearchInput";
import { cn } from "#ui/lib/cn";

/** One thing the picker can choose. `id` is the identity; the rest only helps tell them apart. */
export interface PickerOption {
  /** The second line: the email for a person, the description for a group. */
  detail?: string;
  /** One more field (username, department) shown when name and detail are both shared. */
  extra?: string;
  id: string;
  label: string;
}

export interface SearchPickerProps {
  className?: string;
  /** Wait this long after the last key before searching. */
  debounceMs?: number;
  /** The accessible name of the field. */
  label: string;
  /** The most results shown; a search that fills it says to keep typing. */
  limit?: number;
  /** The fewest characters that start a search. */
  minChars?: number;
  onChange: (option: null | PickerOption) => void;
  placeholder?: string;
  /** Asks the server; it does the matching and the capping, never a full list in the browser. */
  search: (query: string) => Promise<PickerOption[]>;
  value: null | PickerOption;
}

/**
 * A typeahead for choosing a person or a group (#88), one component for every picker: from two
 * characters it asks the server, shows name and email, and picks by the keyboard (the combobox
 * pattern: arrows, Home, End, Enter, Escape) or the mouse. The choice is the option's id, never
 * its name. Two results that share a name and an email show one more field, or the end of the
 * id, so they can be told apart.
 */
export const SearchPicker = ({
  className,
  debounceMs = 250,
  label,
  limit = 10,
  minChars = 2,
  onChange,
  placeholder,
  search,
  value,
}: SearchPickerProps) => {
  const { t } = useTranslation("common");
  const base = useId();
  const [text, setText] = useState(value?.label ?? "");
  const [results, setResults] = useState<null | PickerOption[]>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const latest = useRef(0);
  const query = text.trim();
  const chosen = value !== null && value.label === text;
  const searching = !chosen && query.length >= minChars && results === null && !failed;

  useEffect(() => {
    if (chosen || query.length < minChars) return;
    const ticket = ++latest.current;
    const timer = setTimeout(() => {
      search(query).then(
        (found) => {
          if (ticket !== latest.current) return;
          setResults(found.slice(0, limit));
          setFailed(false);
          setActive(-1);
        },
        () => {
          if (ticket === latest.current) setFailed(true);
        },
      );
    }, debounceMs);
    return () => {
      clearTimeout(timer);
    };
  }, [chosen, debounceMs, limit, minChars, query, search]);

  const shown = !chosen && query.length >= minChars ? (results ?? []) : [];
  const listed = open && shown.length > 0;

  const optionId = (index: number) => `${base}-option-${String(index)}`;

  const type = (next: string) => {
    setText(next);
    setResults(null);
    setFailed(false);
    setOpen(true);
    if (value) onChange(null);
  };

  const pick = (option: PickerOption) => {
    latest.current++;
    setText(option.label);
    setResults(null);
    setOpen(false);
    setActive(-1);
    onChange(option);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = shown.length - 1;
    switch (event.key) {
      case "ArrowDown": {
        if (shown.length === 0) return;
        event.preventDefault();
        setOpen(true);
        setActive((at) => (at >= last ? 0 : at + 1));
        break;
      }
      case "ArrowUp": {
        if (shown.length === 0) return;
        event.preventDefault();
        setOpen(true);
        setActive((at) => (at <= 0 ? last : at - 1));
        break;
      }
      case "End": {
        if (!listed) return;
        event.preventDefault();
        setActive(last);
        break;
      }
      case "Enter": {
        if (listed && active >= 0 && shown[active]) {
          event.preventDefault();
          pick(shown[active]);
        }
        break;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          setActive(-1);
        }
        break;
      }
      case "Home": {
        if (!listed) return;
        event.preventDefault();
        setActive(0);
        break;
      }
      default:
    }
  };

  // Two results alike in name and second line show what else tells them apart.
  const alike = (option: PickerOption) =>
    shown.filter((other) => other.label === option.label && other.detail === option.detail).length >
    1;

  const status = chosen
    ? null
    : query.length < minChars
      ? open && text.length > 0
        ? t("picker.keepTyping", { count: minChars })
        : null
      : failed
        ? t("picker.failed")
        : searching
          ? t("picker.searching")
          : results && results.length === 0
            ? t("picker.noMatch", { query })
            : null;

  return (
    <div className={cn("relative grid gap-1", className)}>
      <SearchInput
        aria-activedescendant={listed && active >= 0 ? optionId(active) : undefined}
        aria-autocomplete="list"
        aria-controls={listed ? `${base}-list` : undefined}
        aria-expanded={listed}
        aria-label={label}
        autoComplete="off"
        onBlur={() => setOpen(false)}
        onChange={(event) => type(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        role="combobox"
        type="text"
        value={text}
      />
      {listed ? (
        <ul
          aria-label={label}
          className="max-h-64 overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-[var(--shadow-3)]"
          id={`${base}-list`}
          role="listbox"
        >
          {shown.map((option, index) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- the combobox input owns the keys
            <li
              aria-selected={index === active}
              className={cn(
                "flex cursor-default flex-col rounded-sm px-2 py-1.5 text-base",
                index === active && "bg-primary-soft text-on-primary-soft",
              )}
              id={optionId(index)}
              key={option.id}
              onClick={() => pick(option)}
              onMouseDown={(event) => event.preventDefault()}
              role="option"
            >
              <span className="font-medium">{option.label}</span>
              {option.detail ? <span className="text-sm text-muted">{option.detail}</span> : null}
              {alike(option) ? (
                <span className="text-xs text-muted">
                  {option.extra ?? t("picker.idTail", { tail: option.id.slice(-4) })}
                </span>
              ) : null}
            </li>
          ))}
          {results && results.length >= limit ? (
            <li className="px-2 py-1 text-xs text-muted" role="presentation">
              {t("picker.capped", { count: limit })}
            </li>
          ) : null}
        </ul>
      ) : null}
      {status ? (
        <p className="text-sm text-muted" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
};
