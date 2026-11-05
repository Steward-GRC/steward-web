// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The editor's surroundings (U11, U17): the header, the save state, presence, and the right
// rail's required sections, appendices and next version.
import { useTranslation } from "@steward-web/i18n";
import { Button, cn, StatusPill } from "@steward-web/ui";
import { Check, ChevronDown, ChevronRight, CircleCheck, CircleX, GripVertical } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Form } from "react-router";

import type { Collaborator } from "./collab/presence";

export type SaveStateKind = "saved" | "saving" | "unsaved";

/** "Saving…", "Saved" with a tick, or "Unsaved changes", announced as it changes. */
export const SaveState = ({ state }: { state: SaveStateKind }) => {
  const { t } = useTranslation("authoring");
  return (
    <span
      aria-live="polite"
      className={cn(
        "flex items-center gap-[5px] text-sm",
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
          {more > 0 ? (
            <span className="ml-2.5 rounded-full bg-sunken px-2 py-[3px] text-xs font-semibold">
              +{more}
            </span>
          ) : null}
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

/** The page's top (U11): eyebrow, serif title, number and version, Draft and the save state. */
export const EditorHeader = ({
  actions,
  eyebrow,
  meta,
  presence,
  saveState,
  title,
}: {
  actions: ReactNode;
  eyebrow: string;
  meta: string;
  presence: ReactNode;
  saveState: SaveStateKind;
  title: string;
}) => {
  const { t } = useTranslation("authoring");
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-start gap-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-muted">{eyebrow}</span>
          <h1 className="font-serif text-[30px] leading-[38px] font-semibold">{title}</h1>
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm text-muted">{meta}</span>
            <StatusPill status="draft" />
            <SaveState state={saveState} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {presence}
          {actions}
        </div>
      </div>
      <p className="text-sm text-muted">
        {t("editor.coAuthored")} · {t("editor.startingPoint")}
      </p>
    </div>
  );
};

/** A rail card with its sunken heading band. */
const RailCard = ({
  aside,
  children,
  title,
  ...props
}: {
  aside?: ReactNode;
  children: ReactNode;
  title: string;
} & Record<`data-${string}`, string>) => {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-lg border border-border bg-surface text-base"
      {...props}
    >
      <div className="flex items-center justify-between border-b border-border-strong bg-sunken px-4 py-3">
        <h2 className="font-semibold" id={titleId}>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
};

/** "Required sections" (U11): a tick per filled section, a cross and "· empty" per empty one. */
export const RequiredSections = ({
  sections,
}: {
  sections: readonly { filled: boolean; title: string }[];
}) => {
  const { t } = useTranslation("authoring");
  const filled = sections.filter((section) => section.filled).length;
  return (
    <RailCard
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
    </RailCard>
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
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
    >
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
    </section>
  );
};

export interface AppendixRow {
  id: string;
  letter: string;
  text: string;
  title: string;
}

const AppendixItem = ({ appendix }: { appendix: AppendixRow }) => {
  const { t } = useTranslation(["authoring", "common"]);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <li className="flex flex-col rounded-md shadow-[inset_0_0_0_1px_var(--border)]">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex items-center gap-2 p-2 text-left"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <GripVertical aria-hidden="true" className="size-4 shrink-0 text-muted" />
        <b className="font-semibold">{appendix.letter}</b>
        <span className="min-w-0 flex-1 truncate">{appendix.title}</span>
        <Chevron aria-hidden="true" className="size-4 shrink-0 text-muted" />
      </button>
      {open ? (
        <div className="flex flex-col gap-2 border-t border-border p-2" id={panelId}>
          <Form className="flex flex-col gap-2" method="post">
            <input name="intent" type="hidden" value="update-appendix" />
            <input name="appendixId" type="hidden" value={appendix.id} />
            <input
              aria-label={t("editor.appendices.titleLabel", { letter: appendix.letter })}
              className="h-9 rounded-md border border-control bg-surface px-2.5"
              defaultValue={appendix.title}
              name="title"
            />
            <textarea
              aria-label={t("editor.appendices.textLabel", { letter: appendix.letter })}
              className="min-h-20 rounded-md border border-control bg-surface px-2.5 py-2"
              defaultValue={appendix.text}
              name="text"
            />
            <div className="flex justify-between gap-2">
              <Button size="sm" type="submit">
                {t("editor.appendices.save")}
              </Button>
            </div>
          </Form>
          <Form method="post">
            <input name="intent" type="hidden" value="delete-appendix" />
            <input name="appendixId" type="hidden" value={appendix.id} />
            <Button size="sm" type="submit" variant="ghost">
              {t("editor.appendices.delete")}
            </Button>
          </Form>
        </div>
      ) : null}
    </li>
  );
};

/** Appendices (U17): an accordion by letter, with Add appendix on the band. */
export const AppendicesPanel = ({
  appendices,
  draftId,
}: {
  appendices: readonly AppendixRow[];
  draftId: string;
}) => {
  const { t } = useTranslation("authoring");
  return (
    <RailCard
      aside={
        <Form method="post">
          <input name="intent" type="hidden" value="add-appendix" />
          <input name="policyVersionId" type="hidden" value={draftId} />
          <button className="text-sm font-semibold text-primary hover:underline" type="submit">
            {t("editor.appendices.add")}
          </button>
        </Form>
      }
      title={t("editor.appendices.title")}
    >
      {appendices.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted">{t("editor.appendices.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1.5 px-2.5 py-2">
          {appendices.map((appendix) => (
            <AppendixItem appendix={appendix} key={appendix.id} />
          ))}
        </ul>
      )}
    </RailCard>
  );
};
