// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveStaticAsset } from "./static";

let clientDirectory: string;

beforeEach(() => {
  clientDirectory = mkdtempSync(path.join(tmpdir(), "steward-static-"));
  mkdirSync(path.join(clientDirectory, "assets"), { recursive: true });
  writeFileSync(path.join(clientDirectory, "assets", "root-abc123.js"), "console.log(1)");
  writeFileSync(path.join(clientDirectory, "favicon.ico"), "x");
});

afterEach(() => {
  rmSync(clientDirectory, { force: true, recursive: true });
});

describe("resolveStaticAsset", () => {
  it("resolves a fingerprinted asset as immutable with the right content type", () => {
    const asset = resolveStaticAsset(clientDirectory, "/assets/root-abc123.js");
    expect(asset?.immutable).toBe(true);
    expect(asset?.type).toBe("text/javascript; charset=utf-8");
  });

  it("resolves a top-level file (favicon) as not immutable", () => {
    const asset = resolveStaticAsset(clientDirectory, "/favicon.ico");
    expect(asset?.immutable).toBe(false);
    expect(asset?.type).toBe("image/x-icon");
  });

  it("returns undefined for a missing file", () => {
    expect(resolveStaticAsset(clientDirectory, "/assets/missing.js")).toBeUndefined();
  });

  it("returns undefined for a path-traversal attempt", () => {
    expect(resolveStaticAsset(clientDirectory, "/../server/index.js")).toBeUndefined();
  });

  it("returns undefined for the bare root (the SSR route handles it)", () => {
    expect(resolveStaticAsset(clientDirectory, "/")).toBeUndefined();
  });

  it("drops the query string before resolving", () => {
    const asset = resolveStaticAsset(clientDirectory, "/favicon.ico?v=2");
    expect(asset?.path.endsWith("favicon.ico")).toBe(true);
  });
});
