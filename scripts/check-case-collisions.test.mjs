// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { execFileSync } from "node:child_process";
import nodePath from "node:path";
import { describe, expect, it } from "vitest";

import { findCaseCollisions } from "./check-case-collisions.mjs";

describe("findCaseCollisions", () => {
  it("flags two modules an extensionless import can't tell apart on a case-insensitive disk", () => {
    expect(
      findCaseCollisions(["src/domain/policyReader.ts", "src/domain/PolicyReader.tsx"]),
    ).toEqual([["src/domain/PolicyReader.tsx", "src/domain/policyReader.ts"]]);
  });

  it("flags two paths that differ only by case", () => {
    expect(findCaseCollisions(["src/Button.tsx", "src/button.tsx"])).toEqual([
      ["src/Button.tsx", "src/button.tsx"],
    ]);
  });

  it("flags folders that differ only by case", () => {
    expect(findCaseCollisions(["src/Domain/a.ts", "src/domain/b.ts"])).toEqual([
      ["src/Domain/a.ts", "src/domain/b.ts"],
    ]);
  });

  it("leaves modules with the same stem and the same case alone", () => {
    expect(findCaseCollisions(["src/Button.ts", "src/Button.tsx"])).toEqual([]);
  });

  it("leaves non-module files that share a stem alone", () => {
    expect(findCaseCollisions(["apps/a/tsconfig.json", "apps/a/tsconfig.tsbuildinfo"])).toEqual([]);
  });
});

describe("the repository", () => {
  it("has no tracked files that collide on a case-insensitive disk", () => {
    const tracked = execFileSync("git", ["ls-files", "-z"], {
      cwd: nodePath.resolve(import.meta.dirname, ".."),
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean);
    expect(findCaseCollisions(tracked)).toEqual([]);
  });
});
