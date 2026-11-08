// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The editor is a large chunk that loads after hydration, so the draft screen showed the document
// before the editor could take over (bug log 177). Asking for the chunk once the app is idle
// puts it in the browser's cache before a draft is opened.
let loading: Promise<typeof import("@steward-web/editor-steward/client")> | undefined;

/** The editor's chunk, fetched once; a failed fetch is tried again on the next ask. */
export const loadEditor = () => {
  loading ??= import("@steward-web/editor-steward/client").catch((error: unknown) => {
    loading = undefined;
    throw error;
  });
  return loading;
};

/** Fetch the chunk ahead of need; a failure is left for the draft screen to report when it asks. */
export const warmEditor = (): Promise<unknown> => loadEditor().catch(() => null);
