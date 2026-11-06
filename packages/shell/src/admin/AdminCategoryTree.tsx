// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ClearSearchButton, cn } from "@steward-web/ui";
import { categoriesPath } from "@steward-web/ui/domain";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

export interface CategoryNode {
  id: string;
  name: string;
  parentId: null | string | undefined;
}

const INDENT = ["pl-1.5", "pl-7", "pl-12"];

const rowClass = (current: boolean) =>
  cn(
    "flex h-8 items-center gap-1.5 rounded-md pr-1.5 text-ink hover:text-ink",
    current &&
      "bg-primary-soft font-semibold text-on-primary-soft shadow-[inset_3px_0_0_var(--primary)] hover:text-on-primary-soft",
  );

/** A category and its ancestors, for keeping a filter match in its place in the tree. */
const withAncestors = (byId: Map<string, CategoryNode>, id: string) => {
  const ids: string[] = [];
  let node = byId.get(id);
  while (node) {
    ids.push(node.id);
    node = node.parentId ? byId.get(node.parentId) : undefined;
  }
  return ids;
};

/**
 * The category tree in the admin panel on Directory and Access (H2): a filter, then each
 * top-level category with a chevron that opens its subcategories (28 px in). Each category
 * opens on the destination showing (`base`: its details on Directory, its access on Access).
 * The category being edited is marked; its branch starts open.
 */
export const AdminCategoryTree = ({
  base = categoriesPath(),
  categories,
}: {
  base?: string;
  categories: readonly CategoryNode[];
}) => {
  const { t } = useTranslation("shell");
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const filter = useRef<HTMLInputElement>(null);
  const byId = useMemo(() => new Map(categories.map((node) => [node.id, node])), [categories]);
  const currentId = /^\/(?:access|categories)\/([^/]+)$/.exec(pathname)?.[1];
  const [open, setOpen] = useState<ReadonlySet<string>>(
    () => new Set(currentId ? withAncestors(byId, currentId) : []),
  );

  const visible = useMemo(() => {
    const words = query.trim().toLowerCase();
    if (!words) return null;
    return new Set(
      categories
        .filter((node) => node.name.toLowerCase().includes(words))
        .flatMap((node) => withAncestors(byId, node.id)),
    );
  }, [byId, categories, query]);

  const childrenOf = (parentId: null | string) =>
    categories.filter(
      (node) => (node.parentId ?? null) === parentId && (visible === null || visible.has(node.id)),
    );

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const branch = (parentId: null | string, depth: number) =>
    childrenOf(parentId).map((node) => {
      const kids = childrenOf(node.id);
      const expanded = visible !== null || open.has(node.id);
      const current = node.id === currentId;
      const Chevron = expanded ? ChevronDown : ChevronRight;
      return (
        <li key={node.id}>
          <div className={cn(rowClass(current), INDENT[Math.min(depth, 2)])}>
            {kids.length > 0 ? (
              <button
                aria-expanded={expanded}
                aria-label={t("admin.categories.showChildren", { category: node.name })}
                className="flex rounded-sm"
                onClick={() => toggle(node.id)}
                type="button"
              >
                <Chevron aria-hidden="true" className="size-4" />
              </button>
            ) : depth === 0 ? (
              <span aria-hidden="true" className="size-4 flex-none" />
            ) : null}
            <Link
              aria-current={current ? "location" : undefined}
              className="min-w-0 flex-1 truncate text-inherit hover:text-inherit"
              to={`${base}/${node.id}`}
            >
              {node.name}
            </Link>
          </div>
          {kids.length > 0 && expanded ? (
            <ul className="flex flex-col gap-px">{branch(node.id, depth + 1)}</ul>
          ) : null}
        </li>
      );
    });

  return (
    <>
      <label className="flex h-[34px] flex-none items-center gap-1.5 rounded-md border border-control px-2 text-sm text-muted focus-within:border-primary">
        <Search aria-hidden="true" className="size-[15px] flex-none" />
        <input
          aria-label={t("admin.categories.filter")}
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.categories.filter")}
          ref={filter}
          type="search"
          value={query}
        />
        {query === "" ? null : <ClearSearchButton input={filter} />}
      </label>
      <ul className="flex flex-col gap-px text-[13.5px]">{branch(null, 0)}</ul>
    </>
  );
};
