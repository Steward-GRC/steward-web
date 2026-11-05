// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  dockerfileDefaultsOff,
  findDevelopmentQuickLoginLeaks,
  TELLS,
} from "./check-no-development-quick-login-leak.mjs";

let root;

afterEach(() => {
  if (root) rmSync(root, { force: true, recursive: true });
});

const appBuild = (app) => {
  const directory = path.join(root, app, "build", "server");
  mkdirSync(directory, { recursive: true });
  return directory;
};

describe("findDevelopmentQuickLoginLeaks", () => {
  it("finds nothing in a clean release build", () => {
    root = mkdtempSync(path.join(tmpdir(), "dev-quick-login-leak-"));
    writeFileSync(path.join(appBuild("staff"), "index.js"), "console.log('hello')");
    expect(findDevelopmentQuickLoginLeaks(root)).toEqual([]);
  });

  it("flags the picker's marker, the users-file variable, the mock source and the gate preview", () => {
    expect(TELLS).toContain("steward-dev-gate-preview");
    expect(TELLS).toEqual(expect.arrayContaining(["STEWARD_DEV_MOCK_URL", "/_mock/controls"]));
    root = mkdtempSync(path.join(tmpdir(), "dev-quick-login-leak-"));
    const files = TELLS.map((tell, index) => {
      const file = path.join(appBuild(index === 0 ? "staff" : "admin"), `chunk-${index}.js`);
      writeFileSync(file, `const x = "${tell}";`);
      return file;
    });
    expect(findDevelopmentQuickLoginLeaks(root).toSorted()).toEqual(files.toSorted());
  });
});

describe("dockerfileDefaultsOff", () => {
  it("accepts the false default only", () => {
    expect(dockerfileDefaultsOff("FROM x\nARG DEV_QUICK_LOGIN=false\n")).toBe(true);
    expect(dockerfileDefaultsOff("FROM x\nARG DEV_QUICK_LOGIN=true\n")).toBe(false);
    expect(dockerfileDefaultsOff("FROM x\nARG DEV_QUICK_LOGIN\n")).toBe(false);
    expect(dockerfileDefaultsOff("FROM x\n")).toBe(false);
  });
});
