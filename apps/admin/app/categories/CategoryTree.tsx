// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  type Failure,
  Field,
  Input,
  Select,
} from "@steward-web/ui";
import { categoryPath } from "@steward-web/ui/domain";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type DragEvent, useMemo, useState } from "react";
import { Link, useFetcher } from "react-router";

import { checkMove, descendantIds, MAX_GROUP_DEPTH, type MoveVerdict, TOP_LEVEL } from "./tree";

/** What the route's move action answers. */
export type MoveResult =
  | { failure?: Failure; id: string; ok: false; verdict?: MoveVerdict }
  | { id: string; ok: true; parentId: null | string };

/** A category as the tree draws it. */
export interface TreeRow {
  id: string;
  name: string;
  owners: number;
  parentId: null | string;
}

const INDENT_PX = 24;

/**
 * The category tree (A3): every category as a node that opens its sub-categories, a click on the
 * name opens the category, and a node moves, with everything under it, by dragging it onto its
 * new parent or with its Move button (a dialog that offers only the parents that keep the branch
 * within the depth limit). Both ask the gateway to move the category.
 */
export const CategoryTree = ({ rows }: { rows: readonly TreeRow[] }) => {
  const { t } = useTranslation("admin");
  const fetcher = useFetcher<MoveResult>();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<ReadonlySet<string>>(
    () => new Set(rows.filter((row) => row.parentId === null).map((row) => row.id)),
  );
  const [dragging, setDragging] = useState<null | string>(null);
  const [over, setOver] = useState<null | string>(null);
  const [moving, setMoving] = useState<null | TreeRow>(null);
  const [target, setTarget] = useState(TOP_LEVEL);
  const [refused, setRefused] = useState<{ id: string; verdict: MoveVerdict } | null>(null);

  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const childrenOf = useMemo(() => {
    const map = new Map<null | string, TreeRow[]>();
    for (const row of rows) map.set(row.parentId, [...(map.get(row.parentId) ?? []), row]);
    return map;
  }, [rows]);
  /** The rows as the tree lists them: each category, then its sub-categories. */
  const ordered = useMemo(() => {
    const out: TreeRow[] = [];
    const walk = (parentId: null | string) => {
      for (const row of childrenOf.get(parentId) ?? []) {
        out.push(row);
        walk(row.id);
      }
    };
    walk(null);
    return out;
  }, [childrenOf]);
  const pathOf = (id: string): string => {
    const names: string[] = [];
    for (let at = byId.get(id); at; at = at.parentId ? byId.get(at.parentId) : undefined)
      names.unshift(at.name);
    return names.join(" › ");
  };

  const words = query.trim().toLowerCase();
  const shown = useMemo(() => {
    if (!words) return null;
    const keep = new Set<string>();
    for (const row of rows) {
      if (!row.name.toLowerCase().includes(words)) continue;
      for (
        let at: TreeRow | undefined = row;
        at;
        at = at.parentId ? byId.get(at.parentId) : undefined
      )
        keep.add(at.id);
    }
    return keep;
  }, [byId, rows, words]);

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const submit = (id: string, parentId: null | string) => {
    setRefused(null);
    void fetcher.submit(
      { groupId: id, intent: "move", parentId: parentId ?? TOP_LEVEL },
      { method: "post" },
    );
  };

  const dropOn = (parentId: null | string) => {
    const id = dragging;
    setDragging(null);
    setOver(null);
    if (!id) return;
    const verdict = checkMove(rows, id, parentId);
    if (verdict === "ok") submit(id, parentId);
    else if (verdict !== "same") setRefused({ id, verdict });
  };

  // Every target accepts the drop, so a refused one can say why; only a fitting one lights up.
  const overTarget = (event: DragEvent, parentId: null | string) => {
    if (!dragging) return;
    event.preventDefault();
    const fits = checkMove(rows, dragging, parentId) === "ok";
    setOver(fits ? (parentId ?? TOP_LEVEL) : null);
  };

  const openMove = (row: TreeRow) => {
    setMoving(row);
    setTarget(row.parentId ?? TOP_LEVEL);
  };
  // Where it is now stays in the list (so the picker shows it); the others are the ones that fit.
  const fits = (parentId: null | string) =>
    moving ? ["ok", "same"].includes(checkMove(rows, moving.id, parentId)) : false;
  const candidates = ordered.filter((row) => fits(row.id));
  const topAllowed = fits(null);
  const options = [
    ...(topAllowed ? [{ label: t("categories.topLevel"), value: TOP_LEVEL }] : []),
    ...candidates.map((row) => ({ label: pathOf(row.id), value: row.id })),
  ];
  const branchSize = moving ? descendantIds(rows, moving.id).size - 1 : 0;

  const result = fetcher.data;
  const nameOf = (id: string) => byId.get(id)?.name ?? "";
  const notice = (() => {
    if (refused) {
      return t(`categories.tree.refused.${refused.verdict}`, {
        max: MAX_GROUP_DEPTH,
        name: nameOf(refused.id),
      });
    }
    if (!result || fetcher.state !== "idle") return null;
    if (result.ok) {
      return result.parentId === null
        ? t("categories.tree.movedTop", { name: nameOf(result.id) })
        : t("categories.tree.moved", { name: nameOf(result.id), parent: nameOf(result.parentId) });
    }
    return null;
  })();

  const renderLevel = (parentId: null | string, level: number) => {
    const level_ = (childrenOf.get(parentId) ?? []).filter((row) => !shown || shown.has(row.id));
    if (level_.length === 0) return null;
    return (
      <ul className="flex flex-col gap-0.5">
        {level_.map((row) => {
          const kids = childrenOf.get(row.id) ?? [];
          const expanded = shown ? true : open.has(row.id);
          const dropState = over === row.id ? "ring-2 ring-primary bg-primary-soft" : "";
          return (
            <li key={row.id}>
              <div
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sunken ${dropState} ${dragging === row.id ? "opacity-50" : ""}`}
                data-testid={`node-${row.id}`}
                draggable
                onDragEnd={() => {
                  setDragging(null);
                  setOver(null);
                }}
                onDragLeave={() => over === row.id && setOver(null)}
                onDragOver={(event) => overTarget(event, row.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", row.id);
                  event.dataTransfer.effectAllowed = "move";
                  setRefused(null);
                  setDragging(row.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  dropOn(row.id);
                }}
                style={{ paddingLeft: 8 + level * INDENT_PX }}
              >
                {kids.length > 0 ? (
                  <button
                    aria-expanded={expanded}
                    aria-label={t(
                      expanded ? "categories.tree.collapse" : "categories.tree.expand",
                      {
                        name: row.name,
                      },
                    )}
                    className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-border hover:text-ink"
                    onClick={() => toggle(row.id)}
                    type="button"
                  >
                    {expanded ? (
                      <ChevronDown aria-hidden="true" className="size-4" />
                    ) : (
                      <ChevronRight aria-hidden="true" className="size-4" />
                    )}
                  </button>
                ) : (
                  <span aria-hidden="true" className="size-6 shrink-0" />
                )}
                <Link
                  className="min-w-0 truncate font-medium text-ink hover:underline"
                  draggable={false}
                  to={categoryPath(row.id)}
                >
                  {row.name}
                </Link>
                <span className="ml-2 hidden gap-3 text-xs text-muted sm:flex">
                  <span>{t("categories.tree.owners", { count: row.owners })}</span>
                  <span>{t("categories.tree.children", { count: kids.length })}</span>
                </span>
                <Button
                  aria-label={t("categories.tree.moveLabel", { name: row.name })}
                  className="ml-auto h-8 px-2.5"
                  onClick={() => openMove(row)}
                  variant="ghost"
                >
                  {t("categories.tree.move")}
                </Button>
              </div>
              {kids.length > 0 && expanded ? renderLevel(row.id, level + 1) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  const failure = result && !result.ok && result.failure ? result.failure : null;
  const refusedByServer = result && !result.ok && result.verdict ? result : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3" role="search">
        <Input
          aria-label={t("categories.search")}
          className="h-[38px] w-full max-w-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("categories.search")}
          type="search"
          value={query}
        />
        <p className="text-xs text-muted">{t("categories.tree.dragHint")}</p>
      </div>
      <div aria-live="polite" role="status">
        {notice ? <p className="text-sm text-ink">{notice}</p> : null}
        {refusedByServer?.verdict ? (
          <p className="text-sm text-ink">
            {t(`categories.tree.refused.${refusedByServer.verdict}`, {
              max: MAX_GROUP_DEPTH,
              name: nameOf(refusedByServer.id),
            })}
          </p>
        ) : null}
      </div>
      {failure ? (
        <Banner
          failure={failure}
          title={t("categories.tree.refused.failed", {
            name: result && !result.ok ? nameOf(result.id) : "",
          })}
          tone="danger"
        />
      ) : null}
      {dragging && checkMove(rows, dragging, null) === "ok" ? (
        // Floats over the page, so showing it never moves the tree under the cursor.
        <div
          className={`fixed inset-x-4 bottom-6 z-40 mx-auto w-fit rounded-md border border-dashed bg-surface px-4 py-3 text-sm shadow-lg ${over === TOP_LEVEL ? "border-primary bg-primary-soft text-ink" : "border-border text-muted"}`}
          onDragLeave={() => over === TOP_LEVEL && setOver(null)}
          onDragOver={(event) => overTarget(event, null)}
          onDrop={(event) => {
            event.preventDefault();
            dropOn(null);
          }}
        >
          {t("categories.tree.dropTop")}
        </div>
      ) : null}
      <nav
        aria-label={t("categories.tree.label")}
        className="rounded-[10px] border border-border bg-surface p-2"
      >
        {renderLevel(null, 0) ?? (
          <p className="p-3 text-sm text-muted">{t("categories.tree.noMatch")}</p>
        )}
      </nav>

      <Dialog onOpenChange={(next) => !next && setMoving(null)} open={moving !== null}>
        <DialogContent
          description={
            moving
              ? branchSize === 0
                ? t("categories.tree.dialog.descriptionLeaf", { name: moving.name })
                : t("categories.tree.dialog.description", { count: branchSize, name: moving.name })
              : undefined
          }
          hasInput
          title={t("categories.tree.dialog.title", { name: moving?.name ?? "" })}
        >
          <fetcher.Form method="post" onSubmit={() => setMoving(null)}>
            <input name="intent" type="hidden" value="move" />
            <input name="groupId" type="hidden" value={moving?.id ?? ""} />
            <DialogBody>
              <Field label={t("categories.tree.dialog.target")}>
                <Select
                  className="h-[38px]"
                  name="parentId"
                  onValueChange={setTarget}
                  options={options}
                  value={target}
                />
              </Field>
              <p className="text-xs text-muted">
                {t("categories.tree.dialog.depthNote", { max: MAX_GROUP_DEPTH })}
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("categories.tree.dialog.cancel")}</Button>
              </DialogClose>
              <Button
                disabled={options.length === 0 || target === (moving?.parentId ?? TOP_LEVEL)}
                type="submit"
              >
                {t("categories.tree.dialog.confirm")}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
