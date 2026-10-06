// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import * as editor from "@steward-web/editor";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Consumers compile against the editor's hand-written declarations, not its sources, so the
// two must not drift: every value the declarations promise has to exist at runtime.
const declarations = readFileSync(
  path.resolve(import.meta.dirname, "../../editor/index.d.ts"),
  "utf8",
);
const declaredValues = [...declarations.matchAll(/export declare const (\w+)/g)].map(
  (match) => match[1]!,
);

describe("the editor's declared surface", () => {
  it("declares the values the adapter uses", () => {
    expect(declaredValues).toEqual(
      expect.arrayContaining(["DEFAULT_NODES", "KoenigComposer", "KoenigEditor"]),
    );
  });

  it.each(declaredValues)("exports %s at runtime", (name) => {
    expect((editor as Record<string, unknown>)[name]).toBeDefined();
  });
});
