// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A draft saves itself once the person has stopped typing for a moment (bug log 192). It keys on
// the content, not on every report from the editor, so the editor wording the document again
// never starts a save, and a failed save is not retried on the same content in a loop: the next
// edit tries again, and "Save draft" always works.
import { useEffect, useRef } from "react";

export interface AutosaveOptions {
  /** The content as it is now: what the next save would send. */
  content: string;
  /** How long the content must be still before it is saved. */
  delayMs: number;
  /** Off while the draft can't be edited or the editor is not up yet. */
  enabled: boolean;
  /** Starts the save. */
  save: () => void;
  /** The content is what was last saved. */
  saved: boolean;
  /** A save is running. */
  saving: boolean;
}

/**
 * Whether the draft may be saved now. A draft in review is saved like any other: the author keeps
 * editing it while the approvers review, and each approver is shown what changed since they last
 * reviewed. Only a missing draft, an editor not up yet or a read-only room stop it.
 */
export const draftCanSave = ({
  collabReadOnly,
  editorReady,
  hasDraft,
}: {
  collabReadOnly: boolean;
  editorReady: boolean;
  hasDraft: boolean;
}): boolean => hasDraft && editorReady && !collabReadOnly;

export const useAutosave = ({
  content,
  delayMs,
  enabled,
  save,
  saved,
  saving,
}: AutosaveOptions): void => {
  // the content the last automatic save was started for, so a failure doesn't loop
  const attempted = useRef<null | string>(null);
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!enabled || saved || saving || attempted.current === content) return;
    const timer = globalThis.setTimeout(() => {
      attempted.current = content;
      saveRef.current();
    }, delayMs);
    return () => globalThis.clearTimeout(timer);
  }, [content, delayMs, enabled, saved, saving]);
};
