// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { findDevelopmentUiIssueLeaks, MARKER } from "./check-no-development-ui-issue-leak.mjs";

let root;

afterEach(() => {
  if (root) rmSync(root, { force: true, recursive: true });
});

const appBuild = (app) => {
  const directory = path.join(root, app, "build", "assets");
  mkdirSync(directory, { recursive: true });
  return directory;
};

describe("findDevelopmentUiIssueLeaks", () => {
  it("finds nothing in a clean release build", () => {
    root = mkdtempSync(path.join(tmpdir(), "dev-ui-issue-leak-"));
    writeFileSync(path.join(appBuild("staff"), "root.js"), "console.log('hello')");
    expect(findDevelopmentUiIssueLeaks(root)).toEqual([]);
  });

  it("flags a file that carries the dev UI-issue marker", () => {
    root = mkdtempSync(path.join(tmpdir(), "dev-ui-issue-leak-"));
    const file = path.join(appBuild("staff"), "root.js");
    writeFileSync(file, `const marker = "${MARKER}";`);
    expect(findDevelopmentUiIssueLeaks(root)).toEqual([file]);
  });

  it("skips an app with no build/ directory yet", () => {
    root = mkdtempSync(path.join(tmpdir(), "dev-ui-issue-leak-"));
    mkdirSync(path.join(root, "admin"), { recursive: true });
    expect(findDevelopmentUiIssueLeaks(root)).toEqual([]);
  });

  it("ignores binary asset extensions (fonts), only scanning built text output", () => {
    root = mkdtempSync(path.join(tmpdir(), "dev-ui-issue-leak-"));
    writeFileSync(path.join(appBuild("staff"), "font.woff2"), `${MARKER}-not-really-text`);
    expect(findDevelopmentUiIssueLeaks(root)).toEqual([]);
  });
});
