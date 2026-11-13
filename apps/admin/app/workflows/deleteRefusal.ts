// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What the gateway's deleteWorkflowDef refusals mean to the editor (steward-gateway#236).
// Framework-free so the route action and its tests share it.

/** A refusal the editor explains in its own words. `count` is what still uses the workflow. */
export type DeleteRefusal =
  | { count: number; kind: "categories" }
  | { count: number; kind: "used" }
  | { kind: "gone" };

const countOf = (counts: Record<string, string> | undefined, key: string): number => {
  const value = Number(counts?.[key]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
};

/**
 * Maps a thrown gateway error to the editor's refusal, or null for anything else (those go
 * through the generic failure banner). Duck-typed on `code` and `counts`, like `refusalOf`.
 */
export const deleteRefusalOf = (error: unknown): DeleteRefusal | null => {
  if (!error || typeof error !== "object") return null;
  const { code, counts } = error as { code?: unknown; counts?: Record<string, string> };
  switch (code) {
    case "WORKFLOW_DEF_IN_USE": {
      return {
        count: countOf(counts, "run_count") + countOf(counts, "override_count"),
        kind: "used",
      };
    }
    case "WORKFLOW_DEF_IN_USE_BY_CATEGORY": {
      return { count: countOf(counts, "category_count"), kind: "categories" };
    }
    case "WORKFLOW_DEF_NOT_FOUND": {
      return { kind: "gone" };
    }
    default: {
      return null;
    }
  }
};
