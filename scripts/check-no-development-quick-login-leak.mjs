// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Fails if a release-configuration app build (apps/*/build/, built without the DEV_QUICK_LOGIN
// build argument) carries the dev quick login: the picker's marker
// (@steward-web/auth's DEV_QUICK_LOGIN_MARKER) or the users-file variable its server reader
// reads. Also fails if the Dockerfile's DEV_QUICK_LOGIN build argument defaults to anything but
// false, since that default is what keeps a release image's build from allowing it. A release
// build should never reach the first state at all: packages/vite-config's
// chooseDevelopmentQuickLogin aliases the real modules in only when the build allows them.
// This is the regression guard, not the primary defence. Run after `pnpm run build`; skips an
// app with no build/ directory (nothing built yet).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const TELLS = ["steward-dev-quick-login", "STEWARD_DEV_QUICK_LOGIN_USERS"];
const TEXT_EXTENSIONS = new Set([".css", ".js", ".mjs"]);

const walk = (directory) => {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath);
    return TEXT_EXTENSIONS.has(entryPath.slice(entryPath.lastIndexOf("."))) ? [entryPath] : [];
  });
};

/** Every file under each app's own build/ directory that carries a dev quick-login tell. */
export const findDevelopmentQuickLoginLeaks = (appsDirectory) => {
  const leaks = [];
  for (const app of readdirSync(appsDirectory)) {
    const buildDirectory = path.join(appsDirectory, app, "build");
    if (!statSync(buildDirectory, { throwIfNoEntry: false })?.isDirectory()) continue;
    for (const file of walk(buildDirectory)) {
      const text = readFileSync(file, "utf8");
      if (TELLS.some((tell) => text.includes(tell))) leaks.push(file);
    }
  }
  return leaks;
};

/** True when the Dockerfile declares `ARG DEV_QUICK_LOGIN=false` and no other default. */
export const dockerfileDefaultsOff = (dockerfile) => {
  const declarations = dockerfile
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^ARG\s+DEV_QUICK_LOGIN(=|\s|$)/.test(line));
  return (
    declarations.length > 0 && declarations.every((line) => line === "ARG DEV_QUICK_LOGIN=false")
  );
};

const main = () => {
  const root = new URL("..", import.meta.url).pathname;
  const leaks = findDevelopmentQuickLoginLeaks(path.join(root, "apps"));
  const dockerfileOk = dockerfileDefaultsOff(readFileSync(path.join(root, "Dockerfile"), "utf8"));
  if (leaks.length > 0) {
    console.error(
      "check-no-development-quick-login-leak: a release build must never hold the dev quick login:",
    );
    for (const file of leaks) console.error(`  ${file}`);
  }
  if (!dockerfileOk) {
    console.error(
      "check-no-development-quick-login-leak: the Dockerfile must declare ARG DEV_QUICK_LOGIN=false",
    );
  }
  if (leaks.length > 0 || !dockerfileOk) {
    process.exitCode = 1;
    return;
  }
  console.log("check-no-development-quick-login-leak: ok");
};

if (import.meta.url === `file://${process.argv[1]}`) main();
