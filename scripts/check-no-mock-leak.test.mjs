// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { findMockLeaks, MARKER } from "./check-no-mock-leak.mjs";

let root;

afterEach(() => {
  if (root) rmSync(root, { force: true, recursive: true });
});

const appBuild = (app) => {
  const directory = path.join(root, app, "build", "assets");
  mkdirSync(directory, { recursive: true });
  return directory;
};

describe("findMockLeaks", () => {
  it("finds nothing in a clean live build", () => {
    root = mkdtempSync(path.join(tmpdir(), "mock-leak-"));
    writeFileSync(path.join(appBuild("staff"), "root.js"), "console.log('hello')");
    expect(findMockLeaks(root)).toEqual([]);
  });

  it("flags a file that carries the mock marker", () => {
    root = mkdtempSync(path.join(tmpdir(), "mock-leak-"));
    const file = path.join(appBuild("staff"), "root.js");
    writeFileSync(file, `const id = "${MARKER}-user-1";`);
    expect(findMockLeaks(root)).toEqual([file]);
  });

  it("skips an app with no build/ directory yet", () => {
    root = mkdtempSync(path.join(tmpdir(), "mock-leak-"));
    mkdirSync(path.join(root, "admin"), { recursive: true });
    expect(findMockLeaks(root)).toEqual([]);
  });

  it("ignores binary asset extensions (fonts), only scanning built text output", () => {
    root = mkdtempSync(path.join(tmpdir(), "mock-leak-"));
    writeFileSync(path.join(appBuild("staff"), "font.woff2"), `${MARKER}-not-really-text`);
    expect(findMockLeaks(root)).toEqual([]);
  });
});
