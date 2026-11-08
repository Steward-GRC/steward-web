// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import authoring from "../../../../packages/i18n/src/locales/en/authoring.json";
import { resetSummaryText } from "./resetSummary";

// the real English wording, with {{titles}} filled in
const t = (key: string, options?: Record<string, unknown>): string => {
  let node: unknown = authoring.editor;
  for (const part of key.replace("editor.", "").split(".")) {
    node = (node as Record<string, unknown>)[part];
  }
  return String(node).replace("{{titles}}", String(options?.titles));
};

describe("what Reset says it did (bug log 203)", () => {
  it("names the headings it put back and the ones it left", () => {
    expect(
      resetSummaryText(t, { kept: ["Purpose"], otherLevel: [], restored: ["Scope", "Roles"] }),
    ).toBe("Put back: Scope, Roles. Already there, left as you wrote it: Purpose.");
  });

  it("says when a kept heading is at the author's own level", () => {
    expect(
      resetSummaryText(t, { kept: ["Purpose"], otherLevel: ["Purpose"], restored: ["Scope"] }),
    ).toBe(
      "Put back: Scope. Already there, left as you wrote it: Purpose. Purpose stays at your heading level, not the template's.",
    );
  });
});
