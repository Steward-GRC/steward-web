// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  LexicalDocumentView,
  type SerializedDocument,
  type StewardEditorProps,
} from "@steward-web/editor-steward";
import { lazy, Suspense, useSyncExternalStore } from "react";

// The editor needs a browser, so it never renders on the server: the server and the first
// client render show the read-only document, and the editor's own chunk loads after
// hydration and takes over. A section's boilerplate body is never collaborative, unlike a
// policy draft, so this carries no `collaboration` prop through.
const StewardEditor = lazy(() => import("@steward-web/editor-steward/client"));

const unsubscribe = () => {};
const subscribe = () => unsubscribe;
const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export type SectionBodyEditorProps = Omit<StewardEditorProps, "collaboration">;

/** A template section's boilerplate content editor — the same Lexical build the policy
 *  authoring editor uses, standalone (no collaboration room). */
export const SectionBodyEditor = (props: SectionBodyEditorProps) => {
  const hydrated = useHydrated();
  const fallback = (document?: SerializedDocument) => (
    <div aria-busy="true" aria-label="Loading the section editor">
      <LexicalDocumentView document={document} />
    </div>
  );
  if (!hydrated) return fallback(props.initialDocument);
  return (
    <Suspense fallback={fallback(props.initialDocument)}>
      <StewardEditor {...props} />
    </Suspense>
  );
};
