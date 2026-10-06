// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { importsLeavingCore } from "./coreIsolation";

// The editor package is a fork of an MIT project that may be lifted out on its own, so it
// must stand alone: nothing under packages/editor may import this adapter, any other
// workspace package, or a file outside its own folder.
const editorRoot = path.resolve(import.meta.dirname, "../../editor");

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    if (name === "node_modules") return [];
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(?:[cm]?[jt]sx?)$/.test(name) ? [full] : [];
  });

describe("the editor core", () => {
  it("never imports the Steward adapter or anything outside its own package", () => {
    const offending = sourceFiles(editorRoot).flatMap((file) =>
      importsLeavingCore(readFileSync(file, "utf8"), file, editorRoot).map(
        (specifier) => `${path.relative(editorRoot, file)}: ${specifier}`,
      ),
    );
    expect(offending).toEqual([]);
  });
});

describe("importsLeavingCore", () => {
  const root = "/repo/packages/editor";
  const file = "/repo/packages/editor/src/koenig-lexical/nodes/ImageNode.tsx";

  it("flags the adapter and other workspace packages", () => {
    expect(
      importsLeavingCore(
        `import {x} from '@steward-web/editor-steward';\nimport y from "@steward-web/i18n";`,
        file,
        root,
      ),
    ).toEqual(["@steward-web/editor-steward", "@steward-web/i18n"]);
  });

  it("flags dynamic imports, re-exports and requires", () => {
    const source = [
      `const m = await import("@steward-web/editor-steward/client");`,
      `export * from '@steward-web/shell';`,
      `const r = require('@steward-web/ui');`,
    ].join("\n");
    expect(importsLeavingCore(source, file, root)).toHaveLength(3);
  });

  it("flags a relative path that climbs out of the package", () => {
    expect(
      importsLeavingCore(`import x from '../../../../editor-steward/src/nodes';`, file, root),
    ).toEqual(["../../../../editor-steward/src/nodes"]);
  });

  it("allows Lexical, the package's own files and its subpath imports", () => {
    const source = [
      `import {$getRoot} from 'lexical';`,
      `import {ImageNode} from '../nodes/ImageNode';`,
      `import {DEFAULT_CONFIG} from '#kg-default-nodes';`,
    ].join("\n");
    expect(importsLeavingCore(source, file, root)).toEqual([]);
  });
});

describe("the guard", () => {
  it("finds the editor package where the guard expects it", () => {
    expect(statSync(path.join(editorRoot, "package.json")).isFile()).toBe(true);
  });
});
