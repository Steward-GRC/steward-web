// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Fails if a LIVE app build (apps/*/build/) carries the mock marker
// (@steward-web/mock-gateway's MOCK_MARKER). A live build should never even reach this
// state: @steward-web/vite-config's chooseEdge aliases the mock edge and banner in only for
// `--mode mock`, so the mock package's code is never part of a live build's module graph.
// This is the regression guard, not the primary defence. Run after `pnpm run build`; skips
// an app with no build/ directory (nothing built yet, or mock-only).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const MARKER = "steward-mock-data";
const TEXT_EXTENSIONS = new Set([".css", ".js", ".mjs"]);

const walk = (directory) => {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return TEXT_EXTENSIONS.has(entryPath.slice(entryPath.lastIndexOf("."))) ? [entryPath] : [];
  });
};

/** Every file under each app's own build/ directory that carries the mock marker. */
export const findMockLeaks = (appsDirectory) => {
  const leaks = [];
  for (const app of readdirSync(appsDirectory)) {
    const buildDirectory = path.join(appsDirectory, app, "build");
    if (!statSync(buildDirectory, { throwIfNoEntry: false })?.isDirectory()) continue;
    for (const file of walk(buildDirectory)) {
      if (readFileSync(file, "utf8").includes(MARKER)) leaks.push(file);
    }
  }
  return leaks;
};

const main = () => {
  const leaks = findMockLeaks(new URL("../apps", import.meta.url).pathname);
  if (leaks.length > 0) {
    console.error("check-no-mock-leak: a live build must never hold mock data or the mock banner:");
    for (const file of leaks) console.error(`  ${file}`);
    process.exitCode = 1;
    return;
  }
  console.log("check-no-mock-leak: ok");
};

if (import.meta.url === `file://${process.argv[1]}`) main();
