// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Fails when two tracked paths would land on the same file on a case-insensitive
// disk (the macOS default). That covers paths that differ only by case and,
// for modules, stems that differ only by case: an extensionless import such as
// "./PolicyReader" tries ".ts" before ".tsx", so next to "policyReader.ts" it
// loads the wrong file on macOS while Linux CI stays green.
import { execFileSync } from "node:child_process";

const moduleExtension = /\.(?:[cm]?[jt]s|[jt]sx)$/;

const recordUnder = (groups, key, variant, path) => {
  const variants = groups.get(key) ?? new Map();
  if (!variants.has(variant)) variants.set(variant, path);
  groups.set(key, variants);
};

export const findCaseCollisions = (paths) => {
  const groups = new Map();
  for (const path of paths) {
    const parts = path.split("/");
    for (let depth = 1; depth < parts.length; depth += 1) {
      const folder = `${parts.slice(0, depth).join("/")}/`;
      recordUnder(groups, folder.toLowerCase(), folder, path);
    }
    const stem = moduleExtension.test(path) ? path.replace(moduleExtension, "") : path;
    recordUnder(groups, `${stem.toLowerCase()}\0`, stem, path);
  }

  const pairs = new Map();
  for (const variants of groups.values()) {
    if (variants.size < 2) continue;
    const [first, ...rest] = [...variants.values()].toSorted();
    for (const other of rest) pairs.set(`${first}\0${other}`, [first, other]);
  }
  return [...pairs.values()].toSorted((a, b) => a.join("\0").localeCompare(b.join("\0")));
};

const main = () => {
  const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
  const collisions = findCaseCollisions(tracked);
  if (collisions.length > 0) {
    console.error("paths that collide on a case-insensitive disk:");
    for (const [a, b] of collisions) console.error(`  ${a}  <->  ${b}`);
    process.exitCode = 1;
    return;
  }
  console.log("no case collisions");
};

if (import.meta.url === `file://${process.argv[1]}`) main();
