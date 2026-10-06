// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  LexicalDocumentView,
  type SerializedDocument,
  type StewardEditorProps,
} from "@steward-web/editor-steward";
import { useTranslation } from "@steward-web/i18n";
import { lazy, Suspense, useSyncExternalStore } from "react";

// The editor needs a browser, so it never renders on the server: the server and the first
// client render show the read-only document, and the editor's own chunk loads after
// hydration and takes over. Routes stay server-rendered either way.
const StewardEditor = lazy(() => import("@steward-web/editor-steward/client"));

const unsubscribe = () => {};
const subscribe = () => unsubscribe;
const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export interface DraftDocumentEditorProps extends StewardEditorProps {
  /** Hold the editor back (show the read-only view) until this is true. */
  ready: boolean;
}

export const DraftDocumentEditor = ({ ready, ...props }: DraftDocumentEditorProps) => {
  const { t } = useTranslation("authoring");
  const hydrated = useHydrated();
  const fallback = (document?: SerializedDocument) => (
    <div aria-busy="true" aria-label={t("editor.loading")}>
      <LexicalDocumentView document={document} />
    </div>
  );
  if (!hydrated || !ready) return fallback(props.initialDocument);
  return (
    <Suspense fallback={fallback(props.initialDocument)}>
      <StewardEditor {...props} />
    </Suspense>
  );
};
