// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// An outline editor for a draft template version's sections: reorder with the up/down buttons,
// change depth with indent/outdent, toggle required, and expand a section to write its
// boilerplate body with the same editor the policy drafts use. Presentational only: the host
// route owns the save action (a hidden `sectionsJson` field mirrors `onChange`'s latest value).
import type { SectionInput } from "@steward-web/api-client";

import { hasText, parseDocument, serializeDocument } from "@steward-web/editor-steward/document";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Input,
  Switch,
} from "@steward-web/ui";
import { useState } from "react";

import { SectionBodyEditor } from "./SectionBodyEditor";
import { newSection, normalizeOutline, outlineNumbers } from "./sectionOutline";

export interface SectionOutlineEditorProps {
  initialSections: readonly SectionInput[];
  /** Fires on every edit (not on the initial mount — the host already has `initialSections`)
   *  with the current, normalized outline. */
  onChange: (sections: readonly SectionInput[]) => void;
}

export const SectionOutlineEditor = ({ initialSections, onChange }: SectionOutlineEditorProps) => {
  const [sections, setSections] = useState<SectionInput[]>(() =>
    normalizeOutline(initialSections.toSorted((a, b) => a.order - b.order)),
  );

  const commit = (next: SectionInput[]) => {
    const normalized = normalizeOutline(next);
    setSections(normalized);
    onChange(normalized);
  };

  const updateSection = (key: string, patch: Partial<SectionInput>) =>
    commit(sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...sections];
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    commit(next);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const next = [...sections];
    [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
    commit(next);
  };

  const indentSection = (index: number) => {
    if (index === 0) return;
    commit(
      sections.map((s, index_) => (index_ === index ? { ...s, level: (s.level ?? 1) + 1 } : s)),
    );
  };

  const outdentSection = (index: number) =>
    commit(
      sections.map((s, index_) => (index_ === index ? { ...s, level: (s.level ?? 1) - 1 } : s)),
    );

  const removeSection = (key: string) => commit(sections.filter((s) => s.key !== key));

  const addSection = () => commit([...sections, newSection(sections)]);

  const setSectionBody = (key: string, documentJson: string) => {
    const document = parseDocument(documentJson);
    const blocks =
      document && hasText(document.root)
        ? [{ contentJson: serializeDocument(document), type: "doc" }]
        : [];
    updateSection(key, { blocks });
  };

  const numbers = outlineNumbers(sections);

  return (
    <div className="flex flex-col gap-4">
      <Accordion type="multiple">
        {sections.map((section, index) => (
          <AccordionItem key={section.key} value={section.key}>
            <div className="flex items-center gap-2 py-1">
              <Badge className="shrink-0 font-mono" tone="neutral">
                H{section.level ?? 1}
              </Badge>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => moveUp(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  ↑
                </Button>
                <Button
                  aria-label="Move down"
                  disabled={index === sections.length - 1}
                  onClick={() => moveDown(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  ↓
                </Button>
                <Button
                  aria-label="Outdent (decrease level)"
                  disabled={(section.level ?? 1) <= 1}
                  onClick={() => outdentSection(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  ←
                </Button>
                <Button
                  aria-label="Indent (increase level)"
                  disabled={index === 0 || (section.level ?? 1) >= 5}
                  onClick={() => indentSection(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  →
                </Button>
              </div>

              <Input
                aria-label={`Section ${index + 1} title`}
                className="flex-1"
                onChange={(event) => updateSection(section.key, { title: event.target.value })}
                placeholder="Section title"
                value={section.title}
              />

              <div className="flex shrink-0 items-center gap-1.5">
                <Switch
                  aria-label="Required"
                  checked={section.required ?? false}
                  onCheckedChange={(checked) => updateSection(section.key, { required: checked })}
                />
                <span className="w-14 text-xs text-muted">
                  {section.required ? "required" : "optional"}
                </span>
              </div>

              <Button
                aria-label="Remove section"
                disabled={sections.length === 1}
                onClick={() => removeSection(section.key)}
                size="icon"
                type="button"
                variant="ghost"
              >
                ×
              </Button>

              <AccordionTrigger className="shrink-0">Body</AccordionTrigger>
            </div>
            <AccordionContent>
              <SectionBodyEditor
                initialDocument={parseDocument(section.blocks[0]?.contentJson)}
                key={section.key}
                onChange={(document) => setSectionBody(section.key, serializeDocument(document))}
                placeholder="Boilerplate for this section (optional)"
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        className="self-start"
        onClick={addSection}
        size="sm"
        type="button"
        variant="secondary"
      >
        Add section
      </Button>

      {sections.length > 0 ? (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Outline preview
          </p>
          <ol className="flex flex-col gap-0.5 font-mono text-xs">
            {sections.map((section, index) => (
              <li
                key={section.key}
                style={{ marginLeft: `${((section.level ?? 1) - 1) * 1.25}rem` }}
              >
                <span className="text-muted">{numbers[index]}</span>
                {"  "}
                {section.title || <span className="italic text-muted">(untitled)</span>}
                {section.required ? <span className="text-muted">{"  "}(required)</span> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
};
