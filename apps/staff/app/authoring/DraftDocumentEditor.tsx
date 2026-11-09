// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  LexicalDocumentView,
  type ReviewerEditorProps,
  type SerializedDocument,
  type StewardEditorProps,
  uploadEditorImage,
} from "@steward-web/editor-steward";
import { useTranslation } from "@steward-web/i18n";
import { recordUiIssueError } from "@steward-web/shell";
import { lazy, Suspense, useSyncExternalStore } from "react";

import { loadEditor } from "./warmEditor";

// The editor needs a browser, so it never renders on the server: the server and the first
// client render show the read-only document, and the editor's own chunk loads after
// hydration and takes over. Routes stay server-rendered either way.
const StewardEditor = lazy(loadEditor);

const unsubscribe = () => {};
const subscribe = () => unsubscribe;
const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export interface DraftDocumentEditorProps extends StewardEditorProps {
  /**
   * The room is still answering. The editor is already mounted and bound to it, but kept out of
   * sight while the read-only document shows, so the room's content is drawn as it arrives rather
   * than being missed (bug log 171). Leave it false for an editor that is not in a room.
   */
  connecting?: boolean;
}

export const DraftDocumentEditor = ({ connecting = false, ...props }: DraftDocumentEditorProps) => {
  const { t } = useTranslation("authoring");
  const hydrated = useHydrated();
  const fallback = (document?: SerializedDocument) => (
    <div aria-busy="true" aria-label={t("editor.loading")}>
      <LexicalDocumentView document={document} />
    </div>
  );
  if (!hydrated) return fallback(props.initialDocument);
  return (
    <>
      {connecting ? fallback(props.initialDocument) : null}
      <div aria-hidden={connecting || undefined} hidden={connecting}>
        <Suspense fallback={fallback(props.initialDocument)}>
          <StewardEditor
            onError={(summary) => recordUiIssueError("render", `editor: ${summary}`)}
            uploadImage={uploadEditorImage}
            {...props}
          />
        </Suspense>
      </div>
    </>
  );
};

// The reviewer's editor loads from the same chunk. The server and the first client render show the
// read-only document, as the author's editor does; the page then frames it like the policy read view.
const ReviewerEditor = lazy(async () => {
  const { ReviewerEditor: component } = await loadEditor();
  return { default: component };
});

export const ReviewerDocument = (props: ReviewerEditorProps) => {
  const { t } = useTranslation("authoring");
  const hydrated = useHydrated();
  const fallback = (
    <div aria-busy="true" aria-label={t("editor.loading")}>
      <LexicalDocumentView document={props.initialDocument} />
      {props.footer}
    </div>
  );
  if (!hydrated) return fallback;
  return (
    <Suspense fallback={fallback}>
      <ReviewerEditor
        onError={(summary) => recordUiIssueError("render", `editor: ${summary}`)}
        {...props}
      />
    </Suspense>
  );
};
