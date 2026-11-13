// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { X } from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "#ui/lib/cn";

/** One thing the picker can hold. `id` is the identity; the rest only helps tell them apart. */
export interface ChipItem {
  /** The second line of an option: the email for a person, the path for a group. */
  description?: string;
  id: string;
  /** What kind of thing it is (`user`, `group`); looked up in `kindLabels` and `kindIcons`. */
  kind?: string;
  label: string;
}

export interface ChipPickerProps {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
  /** Wait this long after the last key before asking `search`. */
  debounceMs?: number;
  /** Nothing can be typed, added or removed, and nothing is submitted. */
  disabled?: boolean;
  /** The id of the input, so a `Field` label points at it. */
  id?: string;
  /** A fixed list to filter in the browser, when the whole set is small. */
  items?: readonly ChipItem[];
  /** Icons by kind, drawn on chips and options. Without one the kind's label is written out. */
  kindIcons?: Readonly<Record<string, ReactNode>>;
  /** Words by kind ("Person", "Group"): the caller translates them. */
  kindLabels?: Readonly<Record<string, string>>;
  /** The accessible name of the field. */
  label: string;
  /** The most results shown; a search that fills it says to keep typing. */
  limit?: number;
  /** The fewest characters that start a search. Defaults to 2 for `search`, 0 for `items`. */
  minChars?: number;
  /** Submits the chips with a form: one hidden input of this name per chip, holding its id. */
  name?: string;
  onChange: (next: readonly ChipItem[]) => void;
  placeholder?: string;
  /** Shows the chips only: no box, no remove buttons. They are still submitted. */
  readOnly?: boolean;
  /**
   * Asks the server (query -> items). It must be a stable function (wrap it in `useCallback`),
   * or every render restarts the debounce.
   */
  search?: (query: string) => Promise<readonly ChipItem[]>;
  /** The chosen items. The picker never changes them itself; it calls `onChange`. */
  value: readonly ChipItem[];
}

/**
 * A multi-select typeahead (#374): the chosen items sit as chips inside the input bar and the
 * next one is typed after them. The combobox pattern: the input has role combobox with
 * `aria-expanded`, `aria-controls` and `aria-activedescendant`; the results are a listbox; arrows,
 * Home, End, Enter and Escape work as in the SearchPicker. Backspace in the empty input or a
 * chip's X removes a chip, and each addition and removal is announced politely. The choice is the
 * item's id, never its label; an item already chosen is never offered or added twice.
 */
export const ChipPicker = ({
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  className,
  debounceMs = 250,
  disabled = false,
  id,
  items,
  kindIcons,
  kindLabels,
  label,
  limit = 10,
  minChars,
  name,
  onChange,
  placeholder,
  readOnly = false,
  search,
  value,
}: ChipPickerProps) => {
  const { t } = useTranslation("common");
  const base = useId();
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef(0);
  const [text, setText] = useState("");
  const [found, setFound] = useState<null | readonly ChipItem[]>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [announcement, setAnnouncement] = useState("");

  const fewest = minChars ?? (search ? 2 : 0);
  const query = text.trim();
  const asking = Boolean(search) && query.length >= fewest;
  const chosenIds = useMemo(() => new Set(value.map((item) => item.id)), [value]);

  useEffect(() => {
    if (!search || query.length < fewest) return;
    const ticket = ++latest.current;
    const timer = setTimeout(() => {
      search(query).then(
        (answer) => {
          if (ticket !== latest.current) return;
          setFound(answer);
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
  }, [debounceMs, fewest, query, search]);

  // The static list filters on the label and the second line; the server's answer is taken as is.
  const matches: readonly ChipItem[] = useMemo(() => {
    if (search) return asking ? (found ?? []) : [];
    if (query.length < fewest) return [];
    const needle = query.toLowerCase();
    return (items ?? []).filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        (item.description ?? "").toLowerCase().includes(needle),
    );
  }, [asking, found, fewest, items, query, search]);
  const shown = useMemo(
    () => matches.filter((item) => !chosenIds.has(item.id)).slice(0, limit),
    [chosenIds, limit, matches],
  );
  const capped = matches.length > limit;
  const listed = open && !disabled && shown.length > 0;
  const searching = asking && found === null && !failed;
  const optionId = (index: number) => `${base}-option-${String(index)}`;

  const announce = (message: string) => setAnnouncement(message);

  const add = (item: ChipItem) => {
    if (chosenIds.has(item.id)) return;
    latest.current++;
    setText("");
    setFound(null);
    setFailed(false);
    setOpen(false);
    setActive(-1);
    announce(t("chipPicker.added", { name: item.label }));
    onChange([...value, item]);
    input.current?.focus();
  };

  const remove = (item: ChipItem) => {
    announce(t("chipPicker.removed", { name: item.label }));
    onChange(value.filter((other) => other.id !== item.id));
    // The button that held focus is gone: the input is the one stable place to land.
    input.current?.focus();
  };

  const type = (next: string) => {
    setText(next);
    setFound(null);
    setFailed(false);
    setOpen(true);
    setActive(-1);
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
      case "Backspace": {
        const tail = value.at(-1);
        if (text === "" && tail) {
          event.preventDefault();
          remove(tail);
        }
        break;
      }
      case "End": {
        if (!listed) return;
        event.preventDefault();
        setActive(last);
        break;
      }
      case "Enter": {
        // Enter picks; it never submits the form around the box while a choice is in progress.
        if (listed && active >= 0 && shown[active]) {
          event.preventDefault();
          add(shown[active]);
        } else if (text !== "" || listed) {
          event.preventDefault();
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

  const kindLabel = (item: ChipItem) => (item.kind ? kindLabels?.[item.kind] : undefined);
  const kindIcon = (item: ChipItem) => (item.kind ? kindIcons?.[item.kind] : undefined);
  const alike = (item: ChipItem) =>
    shown.filter((other) => other.label === item.label && other.description === item.description)
      .length > 1;

  const status =
    query.length < fewest
      ? open && text.length > 0
        ? t("picker.keepTyping", { count: fewest })
        : null
      : failed
        ? t("picker.failed")
        : searching
          ? t("picker.searching")
          : matches.length === 0
            ? t("picker.noMatch", { query })
            : null;

  const hidden =
    name && !disabled
      ? value.map((item) => <input key={item.id} name={name} type="hidden" value={item.id} />)
      : null;

  const chips = value.map((item) => {
    const kind = kindLabel(item);
    const icon = kindIcon(item);
    return (
      <li
        className="flex h-7 max-w-full items-center gap-1.5 rounded-full bg-sunken pr-1 pl-2.5 text-sm"
        key={item.id}
      >
        {icon ? (
          <span aria-hidden="true" className="flex text-muted">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 truncate">{item.label}</span>
        {kind ? <span className={icon ? "sr-only" : "text-xs text-muted"}>{kind}</span> : null}
        {readOnly ? (
          <span className="w-1.5" />
        ) : (
          <button
            aria-label={t("chipPicker.remove", { name: item.label })}
            className="flex size-6 flex-none items-center justify-center rounded-full text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onClick={() => remove(item)}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </li>
    );
  });

  if (readOnly) {
    return (
      <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
        <ul aria-label={t("chipPicker.selected", { label })} className="contents">
          {chips}
        </ul>
        {hidden}
      </div>
    );
  }

  const focusBar = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget || (event.target as HTMLElement).tagName === "UL") {
      input.current?.focus();
    }
  };

  return (
    <div className={cn("relative grid gap-1", className)}>
      {/* The bar is a click target for the input only; the keys all live on the input itself. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={cn(
          "flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-md border border-control bg-surface px-2 py-1 text-base text-ink focus-within:border-primary",
          disabled && "cursor-not-allowed bg-sunken opacity-70",
          invalid && "border-danger",
        )}
        onClick={focusBar}
      >
        <ul aria-label={t("chipPicker.selected", { label })} className="contents">
          {chips}
        </ul>
        <input
          aria-activedescendant={listed && active >= 0 ? optionId(active) : undefined}
          aria-autocomplete="list"
          aria-controls={listed ? `${base}-list` : undefined}
          aria-describedby={describedBy}
          aria-expanded={listed}
          aria-haspopup="listbox"
          aria-invalid={invalid}
          aria-label={id ? undefined : label}
          autoComplete="off"
          className="h-7 min-w-24 flex-1 bg-transparent px-1 placeholder:text-muted focus:outline-none disabled:cursor-not-allowed"
          disabled={disabled}
          id={id}
          onBlur={() => setOpen(false)}
          onChange={(event) => type(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? placeholder : undefined}
          ref={input}
          role="combobox"
          type="text"
          value={text}
        />
      </div>
      {listed ? (
        <ul
          aria-label={label}
          className="absolute top-full right-0 left-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-[var(--shadow-3)]"
          id={`${base}-list`}
          role="listbox"
        >
          {shown.map((item, index) => {
            const kind = kindLabel(item);
            const icon = kindIcon(item);
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- the combobox input owns the keys
              <li
                aria-selected={index === active}
                className={cn(
                  "flex min-h-11 cursor-default flex-col justify-center rounded-sm px-2 py-1.5 text-base",
                  index === active && "bg-primary-soft text-on-primary-soft",
                )}
                id={optionId(index)}
                key={item.id}
                onClick={() => add(item)}
                onMouseDown={(event) => event.preventDefault()}
                role="option"
              >
                <span className="flex items-center gap-1.5">
                  {icon ? (
                    <span aria-hidden="true" className="flex text-muted">
                      {icon}
                    </span>
                  ) : null}
                  <span className="font-medium">{item.label}</span>
                  {kind ? <span className="text-xs text-muted">{kind}</span> : null}
                </span>
                {item.description ? (
                  <span className="text-sm text-muted">{item.description}</span>
                ) : null}
                {alike(item) ? (
                  <span className="text-xs text-muted">
                    {t("picker.idTail", { tail: item.id.slice(-4) })}
                  </span>
                ) : null}
              </li>
            );
          })}
          {capped ? (
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
      <span aria-atomic="true" aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {hidden}
    </div>
  );
};
