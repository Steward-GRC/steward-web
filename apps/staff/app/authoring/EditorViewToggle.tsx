// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { useCallback, useEffect, useId, useState } from "react";

export type EditorView = "diff" | "unified";

const keyOf = (personId: string) => `steward-web:staff:editor-view:${personId}`;

/**
 * Whether this person reads their draft as clean text (unified) or with their changes against
 * the published text marked on the words (diff). It is the person's own setting, kept in their
 * browser: it is never sent into the collaboration room, so one person's choice does not change
 * what another sees (bug log 228).
 */
export const useEditorView = (
  personId: string,
  fallback: EditorView = "unified",
): [EditorView, (view: EditorView) => void] => {
  const [view, setView] = useState<EditorView>(fallback);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(keyOf(personId));
      setView(stored === "diff" || stored === "unified" ? stored : fallback);
    } catch {
      setView(fallback);
    }
  }, [fallback, personId]);
  const choose = useCallback(
    (next: EditorView) => {
      setView(next);
      try {
        localStorage.setItem(keyOf(personId), next);
      } catch {
        // the choice then lasts for this visit only
      }
    },
    [personId],
  );
  return [view, choose];
};

export const EditorViewToggle = ({
  onChange,
  value,
}: {
  onChange: (view: EditorView) => void;
  value: EditorView;
}) => {
  const { t } = useTranslation("authoring");
  const label = useId();
  return (
    <span className="flex items-center gap-2.5 text-sm">
      <span className="text-muted" id={label}>
        {t("editor.view.label")}
      </span>
      <span
        aria-labelledby={label}
        className="flex gap-0.5 rounded-md bg-sunken p-[3px]"
        role="radiogroup"
      >
        {(["unified", "diff"] as const).map((view) => (
          <label
            className={cn(
              "cursor-pointer rounded-sm px-2.5 py-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
              value === view ? "bg-surface font-bold shadow-[var(--shadow-1)]" : "text-muted",
            )}
            key={view}
          >
            <input
              checked={value === view}
              className="sr-only"
              name="editor-view"
              onChange={() => onChange(view)}
              type="radio"
              value={view}
            />
            {t(`editor.view.${view}`)}
          </label>
        ))}
      </span>
    </span>
  );
};
