// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import path from "node:path";

const SPECIFIERS = [
  /\bimport\s+(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']/g,
  /\bexport\s+[^'"]*?\sfrom\s+["']([^"']+)["']/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  /\brequire\(\s*["']([^"']+)["']\s*\)/g,
];

/**
 * The module specifiers in `source` that reach outside the editor package rooted at `root`:
 * any workspace package (`@steward-web/...`, the adapter included) or a relative path that
 * resolves outside `root`. Third-party packages and the package's own `#` imports are fine.
 */
export const importsLeavingCore = (source: string, file: string, root: string): string[] => {
  const found = new Set<string>();
  for (const pattern of SPECIFIERS) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1]!;
      if (specifier.startsWith("@steward-web/")) {
        found.add(specifier);
        continue;
      }
      if (specifier.startsWith(".")) {
        const target = path.resolve(path.dirname(file), specifier);
        const relative = path.relative(root, target);
        if (relative.startsWith("..") || path.isAbsolute(relative)) found.add(specifier);
      }
    }
  }
  return [...found];
};
