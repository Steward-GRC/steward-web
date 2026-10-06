// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Fails if a release-configuration app build (apps/*/build/, built without the
// DEV_UI_ISSUE_COPY build argument) carries the dev UI-issue button's marker
// (@steward-web/shell's DEV_UI_ISSUE_MARKER). A release build should never even reach this
// state: packages/vite-config's chooseDevUiIssueButton aliases the real button's code in
// only when STEWARD_DEV_UI_ISSUE_COPY_BUILD is "true", so it is never part of a release
// build's module graph. This is the regression guard, not the primary defence. Run after
// `pnpm run build`; skips an app with no build/ directory (nothing built yet).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const MARKER = "steward-dev-ui-issue-copy";
const TEXT_EXTENSIONS = new Set([".css", ".js", ".mjs"]);

const walk = (directory) => {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return TEXT_EXTENSIONS.has(entryPath.slice(entryPath.lastIndexOf("."))) ? [entryPath] : [];
  });
};

/** Every file under each app's own build/ directory that carries the dev UI-issue marker. */
export const findDevelopmentUiIssueLeaks = (appsDirectory) => {
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
  const leaks = findDevelopmentUiIssueLeaks(new URL("../apps", import.meta.url).pathname);
  if (leaks.length > 0) {
    console.error(
      "check-no-development-ui-issue-leak: a release build must never hold the dev UI-issue button:",
    );
    for (const file of leaks) console.error(`  ${file}`);
    process.exitCode = 1;
    return;
  }
  console.log("check-no-development-ui-issue-leak: ok");
};

if (import.meta.url === `file://${process.argv[1]}`) main();
