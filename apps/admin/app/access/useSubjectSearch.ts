// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { PickerOption } from "@steward-web/ui";

import { useCallback } from "react";
import { useHref } from "react-router";

/**
 * The picker's `search` for people or groups: asks the admin app's own search route, which
 * matches on the server and caps the answer. The function is stable per kind, so the picker's
 * debounce is not restarted by a re-render.
 */
export const useSubjectSearch = (kind: "group" | "user") => {
  const path = useHref("/resources/subject-search");
  return useCallback(
    async (query: string): Promise<PickerOption[]> => {
      const response = await fetch(
        `${path}?${new URLSearchParams({ kind, q: query }).toString()}`,
        {
          headers: { accept: "application/json" },
        },
      );
      if (!response.ok) throw new Error("search failed");
      const { options } = (await response.json()) as { options: PickerOption[] };
      return options;
    },
    [kind, path],
  );
};
