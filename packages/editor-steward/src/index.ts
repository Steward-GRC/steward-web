// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Server-safe entry: the stored format, the template-section helpers, the read-only view and
// the collab wiring. The editor itself is `@steward-web/editor-steward/client`.
export {
  createStewardCollaboration,
  type ProviderEventSource,
  type StewardCollaboration,
} from "./collab/stewardCollaboration";
export * from "./document";
export { LexicalDocumentView, type LexicalDocumentViewProps } from "./LexicalDocumentView";
export type { StewardEditorHandle, StewardEditorProps } from "./StewardEditor";
