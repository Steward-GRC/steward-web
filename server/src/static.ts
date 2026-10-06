// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { statSync } from "node:fs";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export interface StaticAsset {
  /** A fingerprinted path (Vite's own asset hashing) may be cached forever. */
  immutable: boolean;
  path: string;
  type: string;
}

/**
 * Resolves a request path to a file under the client build, or `undefined` when there is
 * none (including a `../` escape attempt, which resolves outside `clientDirectory` and is
 * refused the same way a missing file is).
 */
export const resolveStaticAsset = (
  clientDirectory: string,
  requestPath: string,
): StaticAsset | undefined => {
  const relative = decodeURIComponent(requestPath.split("?", 1)[0] ?? "").replace(/^\/+/, "");
  if (relative === "") return undefined;

  const resolved = path.join(clientDirectory, relative);
  if (!resolved.startsWith(clientDirectory + path.sep)) return undefined;

  const stat = statSync(resolved, { throwIfNoEntry: false });
  if (!stat?.isFile()) return undefined;

  const type = CONTENT_TYPES[path.extname(resolved)] ?? "application/octet-stream";
  return { immutable: relative.startsWith("assets/"), path: resolved, type };
};
