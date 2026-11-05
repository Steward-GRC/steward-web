// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, useTranslation } from "@steward-web/i18n";
import { ArrowDown, ArrowUp, Columns3 } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useId, useState } from "react";
import { Link } from "react-router";

import { SensitivityBadge } from "#ui/components/Badges";
import { Button } from "#ui/components/Button";
import { Checkbox, Select } from "#ui/components/Controls";
import { Input } from "#ui/components/Input";
import { Popover, PopoverContent, PopoverTrigger } from "#ui/components/Overlays";

import type { DocumentType, Policy } from "./policy";

import { DocumentStatusPill } from "./DocumentStatusPill";
import { policyPath } from "./policy";

export type ColumnKey =
  | "category"
  | "number"
  | "sensitivity"
  | "status"
  | "subcategory"
  | "title"
  | "updated"
  | "version";

export interface LibraryColumn {
  /** Extra classes for the column's cells. */
  cellClass?: string;
  /** A free-text filter, or one value from those the column holds; none for dates. */
  filter?: "text" | "values";
  key: ColumnKey;
  /** How a cell's value reads in a value filter and its chip. */
  label: (value: string, t: Translate) => string;
  render: (policy: Policy) => ReactNode;
  /** The column sorts; sensitivity doesn't. */
  sorts: boolean;
  value: (policy: Policy) => string;
}

type Translate = (key: string, values?: Record<string, unknown>) => string;

/** Every body cell's padding and alignment. */
export const CELL_CLASS = "px-3.5 py-[11px] align-middle";

const statusKey = (status: string) => `status.${status.toLowerCase().replaceAll("_", "-")}`;

/** The library table's columns, in the staff library's order (U3). */
export const LIBRARY_COLUMNS: readonly LibraryColumn[] = [
  {
    filter: "text",
    key: "number",
    label: (value) => value,
    cellClass: "font-mono text-xs",
    render: (policy) => policy.number,
    sorts: true,
    value: (policy) => policy.number,
  },
  {
    filter: "text",
    key: "title",
    label: (value) => value,
    render: (policy) => (
      <Link className="font-semibold text-ink hover:underline" to={policyPath(policy)}>
        {policy.title}
      </Link>
    ),
    sorts: true,
    value: (policy) => policy.title,
  },
  {
    filter: "values",
    key: "category",
    label: (value) => value,
    render: (policy) => policy.category,
    sorts: true,
    value: (policy) => policy.category,
  },
  {
    filter: "values",
    key: "subcategory",
    label: (value) => value,
    render: (policy) => policy.subcategory,
    sorts: true,
    value: (policy) => policy.subcategory,
  },
  {
    filter: "values",
    key: "sensitivity",
    label: (value, t) => t(`sensitivity.${value.toLowerCase()}`),
    render: (policy) => <SensitivityBadge sensitive={policy.sensitivity === "SENSITIVE"} />,
    sorts: false,
    value: (policy) => policy.sensitivity,
  },
  {
    filter: "values",
    key: "status",
    label: (value, t) => t(statusKey(value)),
    render: (policy) => <DocumentStatusPill status={policy.status} />,
    sorts: true,
    value: (policy) => policy.status,
  },
  {
    filter: "text",
    key: "version",
    label: (value) => value,
    cellClass: "font-mono",
    render: (policy) => policy.version,
    sorts: true,
    value: (policy) => policy.version,
  },
  {
    key: "updated",
    label: (value) => formatDate(value),
    cellClass: "text-muted",
    render: (policy) => formatDate(policy.updated),
    sorts: true,
    value: (policy) => policy.updated ?? "",
  },
];

const DEFAULT_ORDER = LIBRARY_COLUMNS.map((column) => column.key);

/** The address's parameter for a column's filter ("f.title"). */
export const filterParameter = (key: ColumnKey) => `f.${key}`;

/** Whether a policy passes every column filter in the address. */
export const matchesColumnFilters = (policy: Policy, parameters: URLSearchParams): boolean =>
  LIBRARY_COLUMNS.every((column) => {
    const wanted = parameters.get(filterParameter(column.key));
    if (!wanted || !column.filter) return true;
    const value = column.value(policy);
    return column.filter === "text"
      ? value.toLowerCase().includes(wanted.trim().toLowerCase())
      : value === wanted;
  });

interface ColumnPreferences {
  hidden: readonly ColumnKey[];
  order: readonly ColumnKey[];
}

const DEFAULTS: ColumnPreferences = { hidden: [], order: DEFAULT_ORDER };

const known = (keys: unknown): ColumnKey[] =>
  Array.isArray(keys) ? keys.filter((key): key is ColumnKey => DEFAULT_ORDER.includes(key)) : [];

const readPreferences = (storageKey: string): ColumnPreferences => {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem(storageKey) ?? "null") as {
      hidden?: unknown;
      order?: unknown;
    } | null;
    if (!raw) return DEFAULTS;
    const order = known(raw.order);
    // A column added since the order was saved goes at the end.
    return {
      hidden: known(raw.hidden),
      order: [...order, ...DEFAULT_ORDER.filter((key) => !order.includes(key))],
    };
  } catch {
    return DEFAULTS;
  }
};

/**
 * Which columns show and in what order, a per-browser preference like the stars. The server
 * render has none, so it starts with the default and catches up after hydration.
 */
export const useColumnPreferences = (documentType: DocumentType) => {
  const storageKey = `steward:library.columns.${documentType.toLowerCase()}`;
  const [preferences, setPreferences] = useState<ColumnPreferences>(DEFAULTS);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
    setPreferences(readPreferences(storageKey));
  }, [storageKey]);

  const change = useCallback(
    (next: (current: ColumnPreferences) => ColumnPreferences) =>
      setPreferences((current) => {
        const updated = next(current);
        try {
          globalThis.localStorage?.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // Storage can be blocked; the change still applies to this page.
        }
        return updated;
      }),
    [storageKey],
  );

  const toggle = (key: ColumnKey) =>
    change((current) => ({
      ...current,
      hidden: current.hidden.includes(key)
        ? current.hidden.filter((hidden) => hidden !== key)
        : [...current.hidden, key],
    }));

  const move = (key: ColumnKey, by: -1 | 1) =>
    change((current) => {
      const order = [...current.order];
      const from = order.indexOf(key);
      const to = from + by;
      if (from === -1 || to < 0 || to >= order.length) return current;
      [order[from], order[to]] = [order[to]!, order[from]!];
      return { ...current, order };
    });

  const visible = preferences.order
    .filter((key) => !preferences.hidden.includes(key))
    .map((key) => LIBRARY_COLUMNS.find((column) => column.key === key)!);

  return { move, order: preferences.order, preferences, toggle, visible };
};

/**
 * "Columns": each column with a checkbox to show or hide it and buttons to move it earlier or
 * later. Title always shows, since it's the row's link.
 */
export const ColumnsMenu = ({
  hidden,
  onMove,
  onToggle,
  order,
}: {
  hidden: readonly ColumnKey[];
  onMove: (key: ColumnKey, by: -1 | 1) => void;
  onToggle: (key: ColumnKey) => void;
  order: readonly ColumnKey[];
}) => {
  const { t } = useTranslation("policy");
  const id = useId();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-[38px] px-3" variant="secondary">
          <Columns3 aria-hidden="true" />
          {t("library.columns.button")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <ul aria-label={t("library.columns.button")} className="flex flex-col">
          {order.map((key, index) => {
            const name = t(`library.table.${key}`);
            return (
              <li className="flex items-center gap-2 rounded-md px-1.5 py-1" key={key}>
                <Checkbox
                  checked={!hidden.includes(key)}
                  disabled={key === "title"}
                  id={`${id}-${key}`}
                  onCheckedChange={() => onToggle(key)}
                />
                <label className="flex-1 text-sm" htmlFor={`${id}-${key}`}>
                  {name}
                </label>
                <button
                  aria-label={t("library.columns.earlier", { column: name })}
                  className="rounded p-1 text-muted hover:bg-sunken hover:text-ink disabled:opacity-40"
                  disabled={index === 0}
                  onClick={() => onMove(key, -1)}
                  type="button"
                >
                  <ArrowUp aria-hidden="true" className="size-3.5" />
                </button>
                <button
                  aria-label={t("library.columns.later", { column: name })}
                  className="rounded p-1 text-muted hover:bg-sunken hover:text-ink disabled:opacity-40"
                  disabled={index === order.length - 1}
                  onClick={() => onMove(key, 1)}
                  type="button"
                >
                  <ArrowDown aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

const ANY = "any";

/** The filter row's control for one column: words for text, a pick for values. */
export const ColumnFilter = ({
  column,
  onChange,
  policies,
  value,
}: {
  column: LibraryColumn;
  onChange: (value: string) => void;
  policies: readonly Policy[];
  value: string;
}) => {
  const { t } = useTranslation("policy");
  if (!column.filter) return null;
  const label = t("library.columns.filter", { column: t(`library.table.${column.key}`) });
  if (column.filter === "text") {
    return (
      <Input
        aria-label={label}
        className="h-8 text-sm"
        defaultValue={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
      />
    );
  }
  const values = [...new Set(policies.map((policy) => column.value(policy)))]
    .filter(Boolean)
    .toSorted((a, b) => a.localeCompare(b));
  return (
    <Select
      aria-label={label}
      className="h-8 text-sm"
      onValueChange={(next) => onChange(next === ANY ? "" : next)}
      options={[
        { label: t("library.columns.any"), value: ANY },
        ...values.map((option) => ({ label: column.label(option, t), value: option })),
      ]}
      value={value || ANY}
    />
  );
};
