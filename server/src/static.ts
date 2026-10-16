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
 * Strips `basename` from `pathname`, matching only on a full path element (so `/admin` never
 * matches a path like `/adminfoo`). Returns `undefined` when `pathname` isn't under `basename`.
 */
const stripBasename = (pathname: string, basename: string): string | undefined => {
  if (basename === "") return pathname;
  if (pathname === basename) return "/";
  if (pathname.startsWith(`${basename}/`)) return pathname.slice(basename.length);
  return undefined;
};

/**
 * Resolves a request path to a file under the client build, or `undefined` when there is
 * none (including a `../` escape attempt, which resolves outside `clientDirectory` and is
 * refused the same way a missing file is). `basename` is the app's own URL prefix (the admin
 * app is served under `/admin`, by `apps/admin/react-router.config.ts`'s `basename` and the
 * matching Vite `base`); a request outside it is left for the SSR route to handle.
 */
export const resolveStaticAsset = (
  clientDirectory: string,
  requestPath: string,
  basename = "",
): StaticAsset | undefined => {
  const pathname = decodeURIComponent(requestPath.split("?", 1)[0] ?? "");
  const withoutBasename = stripBasename(pathname, basename);
  if (withoutBasename === undefined) return undefined;

  const relative = withoutBasename.replace(/^\/+/, "");
  if (relative === "") return undefined;

  const resolved = path.join(clientDirectory, relative);
  if (!resolved.startsWith(clientDirectory + path.sep)) return undefined;

  const stat = statSync(resolved, { throwIfNoEntry: false });
  if (!stat?.isFile()) return undefined;

  const type = CONTENT_TYPES[path.extname(resolved)] ?? "application/octet-stream";
  return { immutable: relative.startsWith("assets/"), path: resolved, type };
};
