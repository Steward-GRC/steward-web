// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A draft template version's sections as A7's rows: a grip, the outline number, the title, the
// heading level and the required switch. Presentational: the route owns the save, and this
// reports every edit through `onChange` with the outline normalised.
import type { SectionInput } from "@steward-web/api-client";

import { hasText, parseDocument, serializeDocument } from "@steward-web/editor-steward/document";
import { useTranslation } from "@steward-web/i18n";
import { Button, Switch } from "@steward-web/ui";
import { GripVertical, X } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";

import { SectionBodyEditor } from "./SectionBodyEditor";
import { clampLevel, newSection, normalizeOutline, outlineNumbers } from "./sectionOutline";

export interface SectionOutlineEditorProps {
  onChange: (sections: readonly SectionInput[]) => void;
  sections: readonly SectionInput[];
}

/** Sorts and normalises the server's sections for the editor's first render. */
export const outlineOf = (sections: readonly SectionInput[]): SectionInput[] =>
  normalizeOutline(sections.toSorted((a, b) => a.order - b.order));

/**
 * The Sections step (A7): drag a row by its grip, or focus the grip and use the arrow keys (up
 * and down move it, right and left indent and outdent it, H1–H5). Each row's switch makes the
 * section required, "Text" opens its boilerplate, and the cross removes it.
 */
export const SectionOutlineEditor = ({ onChange, sections }: SectionOutlineEditorProps) => {
  const { t } = useTranslation("admin");
  const listId = useId();
  const hintId = useId();
  const [dragging, setDragging] = useState<null | number>(null);
  const [open, setOpen] = useState<null | string>(null);
  const numbers = outlineNumbers(sections);

  const commit = (next: readonly SectionInput[]) => onChange(normalizeOutline(next));
  const update = (key: string, patch: Partial<SectionInput>) =>
    commit(sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sections.length || from === to) return;
    const next = [...sections];
    const [moving] = next.splice(from, 1);
    next.splice(to, 0, moving!);
    commit(next);
  };
  const shift = (index: number, delta: -1 | 1) => {
    const section = sections[index]!;
    update(section.key, { level: clampLevel((section.level ?? 1) + delta) });
  };
  const onGripKey = (index: number) => (event: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(index, index + 1),
      ArrowLeft: () => shift(index, -1),
      ArrowRight: () => shift(index, 1),
      ArrowUp: () => move(index, index - 1),
    };
    const run = keys[event.key];
    if (run) {
      event.preventDefault();
      run();
    }
  };
  const setBody = (key: string, documentJson: string) => {
    const document = parseDocument(documentJson);
    update(key, {
      blocks:
        document && hasText(document.root)
          ? [{ contentJson: serializeDocument(document), type: "doc" }]
          : [],
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="sr-only" id={hintId}>
        {t("templates.detail.sections.moveHint")}
      </span>
      <ul
        aria-label={t("templates.detail.sections.label")}
        className="flex flex-col rounded-[10px] border border-border bg-surface p-1.5"
        id={listId}
      >
        {sections.map((section, index) => {
          const title = section.title || t("templates.detail.sections.untitled");
          return (
            <li
              className="flex flex-col"
              key={section.key}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragging !== null) move(dragging, index);
                setDragging(null);
              }}
            >
              <div
                className="flex items-center gap-2 rounded-md p-2"
                style={{ marginLeft: `${((section.level ?? 1) - 1) * 24}px` }}
              >
                <button
                  aria-describedby={hintId}
                  aria-label={t("templates.detail.sections.move", { title })}
                  className="flex cursor-grab text-muted hover:text-ink"
                  draggable
                  onDragStart={() => setDragging(index)}
                  onKeyDown={onGripKey(index)}
                  type="button"
                >
                  <GripVertical aria-hidden="true" className="size-4" />
                </button>
                <span className="w-7 flex-none font-mono text-xs font-medium text-muted">
                  {numbers[index]}
                </span>
                <input
                  aria-label={t("templates.detail.sections.title", { number: numbers[index] })}
                  className="min-w-0 flex-1 rounded-sm bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                  onChange={(event) => update(section.key, { title: event.target.value })}
                  placeholder={t("templates.detail.sections.untitled")}
                  value={section.title}
                />
                <span className="font-mono text-2xs font-medium text-muted">
                  H{section.level ?? 1}
                </span>
                <Switch
                  aria-label={t("templates.detail.sections.required")}
                  checked={section.required ?? false}
                  onCheckedChange={(checked) => update(section.key, { required: checked })}
                />
                <button
                  aria-expanded={open === section.key}
                  aria-label={t("templates.detail.sections.body", { title })}
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => setOpen(open === section.key ? null : section.key)}
                  type="button"
                >
                  {t("templates.detail.sections.editBody")}
                </button>
                <button
                  aria-label={t("templates.detail.sections.remove", { title })}
                  className="flex size-6 items-center justify-center rounded-md text-muted hover:bg-sunken hover:text-ink disabled:opacity-40"
                  disabled={sections.length === 1}
                  onClick={() => commit(sections.filter((s) => s.key !== section.key))}
                  type="button"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
              {open === section.key ? (
                <div className="px-2 pb-2">
                  <SectionBodyEditor
                    initialDocument={parseDocument(section.blocks[0]?.contentJson)}
                    key={section.key}
                    onChange={(document) => setBody(section.key, serializeDocument(document))}
                    placeholder={t("templates.detail.sections.bodyPlaceholder")}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Button
        className="self-start"
        onClick={() => commit([...sections, newSection(sections)])}
        size="sm"
        variant="secondary"
      >
        {t("templates.detail.sections.add")}
      </Button>
      <span className="text-xs text-muted">{t("templates.detail.sections.hint")}</span>
    </div>
  );
};
