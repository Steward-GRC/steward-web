// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The editor's surroundings (U11, U17): the header, the save state, presence, and the right
// rail's required sections, appendices and next version.
import { useTranslation } from "@steward-web/i18n";
import {
  Badge,
  Button,
  Card,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  StatusPill,
} from "@steward-web/ui";
import { draftPath } from "@steward-web/ui/domain";
import { ArrowDown, ArrowUp, Check, CircleCheck, CircleX, GripVertical } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Form, Link, useFetcher } from "react-router";

import type { Collaborator } from "./collab/presence";

export type SaveStateKind = "saved" | "saving" | "unsaved";

/** "Saving…", "Saved" with a tick, or "Unsaved changes", announced as it changes. */
export const SaveState = ({ state }: { state: SaveStateKind }) => {
  const { t } = useTranslation("authoring");
  return (
    <span
      aria-live="polite"
      className={cn(
        // one slot for all three states: the same width and one line, so a change of state does
        // not move the text beside it or wrap onto another line (bug log 235)
        "flex min-w-[7.5rem] items-center gap-[5px] text-sm whitespace-nowrap",
        state === "unsaved" ? "text-warn" : "text-muted",
      )}
      role="status"
    >
      {state === "saved" ? <Check aria-hidden="true" className="size-[1.15em]" /> : null}
      {t(`editor.saveState.${state}`)}
    </span>
  );
};

export type PresenceState = "live" | "published" | "reconnecting" | "together";

const PILLS: Record<PresenceState, string> = {
  live: "bg-info-soft text-info",
  published: "bg-neutral-soft text-neutral",
  reconnecting: "bg-warn-soft text-warn",
  together: "bg-ok-soft text-ok",
};

const MAX_AVATARS = 4;

/**
 * Who else is editing (U11): up to four avatars ringed in each person's colour and "+N", and
 * the room's state: "Editing together", "Live", "Reconnecting…" or "Published as v{n} —
 * read-only".
 */
export const Presence = ({
  collaborators,
  publishedVersion,
  state,
}: {
  collaborators: readonly Collaborator[];
  publishedVersion?: string;
  state: PresenceState;
}) => {
  const { t } = useTranslation("authoring");
  const shown = collaborators.slice(0, MAX_AVATARS);
  const more = collaborators.length - shown.length;
  return (
    <div className="flex items-center gap-2.5">
      {collaborators.length > 0 ? (
        <div aria-label={t("editor.presence.group")} className="flex items-center" role="group">
          {shown.map((person, index) => (
            <span
              aria-label={person.name}
              className="flex size-8 items-center justify-center rounded-full bg-surface text-xs font-semibold"
              key={person.uid}
              role="img"
              style={{
                boxShadow: `0 0 0 2.5px ${person.color}`,
                color: person.color,
                marginLeft: index === 0 ? 0 : -6,
                zIndex: MAX_AVATARS - index,
              }}
            >
              {person.name.charAt(0).toUpperCase()}
            </span>
          ))}
          {more > 0 ? <Badge className="ml-2.5">+{more}</Badge> : null}
        </div>
      ) : null}
      <span
        className={cn(
          "flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-xs font-semibold",
          PILLS[state],
        )}
      >
        {state === "published" ? null : (
          <span
            aria-hidden="true"
            className={cn(
              "size-[7px] rounded-full",
              state === "reconnecting" ? "border border-current" : "bg-current",
            )}
          />
        )}
        {t(`editor.presence.${state}`, { version: publishedVersion })}
      </span>
    </div>
  );
};

/** The page's top (U11): breadcrumb, serif title, number and version, Draft and the save state. */
export const EditorHeader = ({
  actions,
  breadcrumb,
  meta,
  presence,
  saveState,
  status = "draft",
  title,
}: {
  actions: ReactNode;
  breadcrumb: ReactNode;
  meta: string;
  presence: ReactNode;
  saveState: SaveStateKind;
  /** The version's real status: a draft, or in review once it has been submitted. */
  status?: "draft" | "in-review";
  title: string;
}) => {
  const { t } = useTranslation("authoring");
  return (
    <div className="@container flex flex-col gap-3.5">
      {/* The buttons sit above the breadcrumb, title and number until the header is wide enough
          for a row, then beside them (bug log 198). The container's own width decides, not the
          window's: the sidebar takes a share of it. */}
      <div className="flex flex-col-reverse gap-3.5 @4xl:flex-row @4xl:items-start">
        <div className="flex min-w-0 flex-col gap-1 @4xl:min-w-[22rem] @4xl:flex-1">
          {breadcrumb}
          <h1 className="font-serif text-[30px] leading-[38px] font-semibold">{title}</h1>
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm text-muted">{meta}</span>
            <StatusPill status={status} />
            {presence}
            <SaveState state={saveState} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 @4xl:justify-end">{actions}</div>
      </div>
      <p className="text-sm text-muted">
        {t("editor.coAuthored")} · {t("editor.startingPoint")}
      </p>
    </div>
  );
};

/** "Required sections" (U11): a tick per filled section, a cross and "· empty" per empty one. */
export const RequiredSections = ({
  onReset,
  sections,
}: {
  /** Put the missing or renamed required headings back. Offered only when there are some. */
  onReset?: () => void;
  sections: readonly { filled: boolean; title: string }[];
}) => {
  const { t } = useTranslation("authoring");
  const filled = sections.filter((section) => section.filled).length;
  return (
    <Card
      aside={
        <span className="text-xs font-medium text-muted">
          {t("editor.required.count", { filled, total: sections.length })}
        </span>
      }
      data-complete={String(filled === sections.length)}
      title={t("editor.required.title")}
    >
      <ul className="flex flex-col px-2.5 py-2">
        {sections.map((section) => (
          <li
            className={cn(
              "flex items-center gap-2.5 rounded-md px-1.5 py-[7px]",
              section.filled ? "text-ok" : "bg-danger-soft text-danger",
            )}
            data-filled={String(section.filled)}
            key={section.title}
          >
            {section.filled ? (
              <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <CircleX aria-hidden="true" className="size-4 shrink-0" />
            )}
            {section.filled ? (
              <span className="text-ink">{section.title}</span>
            ) : (
              <span className="font-semibold">
                {section.title} <span className="font-normal">· {t("editor.required.empty")}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
      {onReset ? (
        <div className="px-2.5 pb-2.5">
          <Button onClick={onReset} size="sm" type="button" variant="secondary">
            {t("editor.required.reset")}
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

/** "Next version" (U11): v1.0.0 for a first publish; the type is worked out on submit. */
export const NextVersion = ({
  firstPublish,
  published,
}: {
  firstPublish: boolean;
  published?: string;
}) => {
  const { t } = useTranslation("authoring");
  const titleId = useId();
  return (
    <Card aria-labelledby={titleId} className="flex flex-col gap-2 px-4 py-3 text-sm">
      <h2 className="text-base font-semibold" id={titleId}>
        {t("editor.nextVersion.title")}
      </h2>
      {firstPublish ? (
        <span className="flex items-center gap-2">
          <b className="font-mono">v1.0.0</b>
          <span className="text-muted">· {t("editor.nextVersion.first")}</span>
        </span>
      ) : published ? (
        <span>{t("editor.nextVersion.after", { version: published })}</span>
      ) : null}
      <span className="text-muted">{t("editor.nextVersion.workedOut")}</span>
    </Card>
  );
};

export interface AppendixRow {
  /** A newer draft is being written beside the published appendix. */
  draft: boolean;
  id: string;
  /** The place among the live appendices; empty while retired. */
  letter: string;
  /** Readers can see a published row. */
  published: boolean;
  retired: boolean;
  title: string;
}

type Move = "down" | "up";

const AppendixItem = ({
  appendix,
  dragging,
  first,
  last,
  number,
  onDragEnd,
  onDragStart,
  onDrop,
  onMove,
}: {
  appendix: AppendixRow;
  dragging: boolean;
  first: boolean;
  last: boolean;
  number: string;
  onDragEnd: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onMove: (move: Move) => void;
}) => {
  const { t } = useTranslation(["authoring", "common"]);
  const [retiring, setRetiring] = useState(false);
  const name = t("editor.appendices.name", { letter: appendix.letter, title: appendix.title });
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm shadow-[inset_0_0_0_1px_var(--border)]",
        dragging && "opacity-50",
      )}
      draggable
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={(event) => {
        event.dataTransfer?.setData("text/plain", appendix.id);
        onDragStart();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      <GripVertical aria-hidden="true" className="size-4 shrink-0 text-muted" />
      <b className="font-semibold">{appendix.letter}</b>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{appendix.title}</span>
        {appendix.published ? (
          appendix.draft ? (
            <span className="text-xs text-muted">{t("editor.appendices.draftBadge")}</span>
          ) : null
        ) : (
          <span className="text-xs text-muted">{t("editor.appendices.unpublishedBadge")}</span>
        )}
      </span>
      <Link
        aria-label={t("editor.appendices.editLabel", { letter: appendix.letter })}
        className="font-semibold text-primary hover:underline"
        to={draftPath(number, `appendices/${appendix.letter}`)}
      >
        {t("editor.appendices.edit")}
      </Link>
      {(["up", "down"] as const).map((move) => (
        <button
          aria-label={t(`editor.appendices.move.${move}`, { letter: appendix.letter })}
          className="rounded-sm p-1 hover:bg-sunken disabled:opacity-40"
          disabled={move === "up" ? first : last}
          key={move}
          onClick={() => onMove(move)}
          type="button"
        >
          {move === "up" ? (
            <ArrowUp aria-hidden="true" className="size-3.5" />
          ) : (
            <ArrowDown aria-hidden="true" className="size-3.5" />
          )}
        </button>
      ))}
      <button
        aria-label={t("editor.appendices.retireLabel", { letter: appendix.letter })}
        className="font-semibold text-danger hover:underline"
        onClick={() => setRetiring(true)}
        type="button"
      >
        {t("editor.appendices.retire")}
      </button>
      <Dialog onOpenChange={setRetiring} open={retiring}>
        <DialogContent
          description={t("editor.appendices.retireDescription", { name })}
          title={t("editor.appendices.retireTitle")}
        >
          <Form method="post" onSubmit={() => setRetiring(false)}>
            <input name="intent" type="hidden" value="retire-appendix" />
            <input name="appendixId" type="hidden" value={appendix.id} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("editor.appendices.keep")}</Button>
              </DialogClose>
              <Button type="submit" variant="danger">
                {t("editor.appendices.retireButton")}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </li>
  );
};

/** `ids` with the one at `from` moved to `to`. */
const moved = (ids: readonly string[], from: number, to: number): string[] => {
  const next = [...ids];
  const [id] = next.splice(from, 1);
  if (id !== undefined) next.splice(to, 0, id);
  return next;
};

/**
 * Appendices (U17): the policy's own appendices by letter, each opening on its own page; they have
 * a life of their own (draft, published, retired), so they are listed here and written there.
 */
export const AppendicesPanel = ({
  appendices,
  number,
  policyId,
}: {
  appendices: readonly AppendixRow[];
  number: string;
  policyId: string;
}) => {
  const { t } = useTranslation("authoring");
  const reorder = useFetcher();
  const [dragged, setDragged] = useState<null | string>(null);
  const live = appendices.filter((a) => !a.retired);
  const retired = appendices.filter((a) => a.retired);
  // While a reorder is on its way, show the order it asked for.
  const pending = reorder.formData?.get("orderedIds");
  const ids = typeof pending === "string" ? pending.split(",") : live.map((a) => a.id);
  const ordered = ids
    .map((id) => live.find((appendix) => appendix.id === id))
    .filter((appendix): appendix is AppendixRow => appendix !== undefined);
  const send = (next: readonly string[]) =>
    void reorder.submit(
      { intent: "reorder-appendices", orderedIds: next.join(","), policyId },
      { method: "post" },
    );
  return (
    <>
      <Card
        aside={
          <Form method="post">
            <input name="intent" type="hidden" value="add-appendix" />
            <input name="policyId" type="hidden" value={policyId} />
            <button className="text-sm font-semibold text-primary hover:underline" type="submit">
              {t("editor.appendices.add")}
            </button>
          </Form>
        }
        title={t("editor.appendices.title")}
      >
        {ordered.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted">{t("editor.appendices.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-1.5 px-2.5 py-2">
            {ordered.map((appendix, index) => (
              <AppendixItem
                appendix={appendix}
                dragging={dragged === appendix.id}
                first={index === 0}
                key={appendix.id}
                last={index === ordered.length - 1}
                number={number}
                onDragEnd={() => setDragged(null)}
                onDragStart={() => setDragged(appendix.id)}
                onDrop={() => {
                  const from = ordered.findIndex((row) => row.id === dragged);
                  setDragged(null);
                  if (from === -1 || from === index) return;
                  send(
                    moved(
                      ordered.map((row) => row.id),
                      from,
                      index,
                    ),
                  );
                }}
                onMove={(move) =>
                  send(
                    moved(
                      ordered.map((row) => row.id),
                      index,
                      move === "up" ? index - 1 : index + 1,
                    ),
                  )
                }
              />
            ))}
          </ul>
        )}
      </Card>
      {retired.length > 0 ? (
        <Card title={t("editor.appendices.retired")}>
          <ul className="flex flex-col gap-1.5 px-2.5 py-2">
            {retired.map((appendix) => (
              <li
                className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm shadow-[inset_0_0_0_1px_var(--border)]"
                key={appendix.id}
              >
                <span className="min-w-0 flex-1 truncate text-muted">{appendix.title}</span>
                <Form method="post">
                  <input name="intent" type="hidden" value="restore-appendix" />
                  <input name="appendixId" type="hidden" value={appendix.id} />
                  <button
                    aria-label={t("editor.appendices.restoreLabel", { title: appendix.title })}
                    className="font-semibold text-primary hover:underline"
                    type="submit"
                  >
                    {t("editor.appendices.restore")}
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
};
