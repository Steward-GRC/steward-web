// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: MIT
// Builds the editor's stylesheet with the Tailwind 3 setup the Koenig sources are written for
// (its own theme, `important: '.koenig-lexical'`, no global preflight), so the apps' Tailwind 4
// build never has to read these classes. The output is committed as src/generated/koenig.css;
// run `pnpm --filter @steward-web/editor build:css` after changing a class name in the sources.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import tailwindNesting from "tailwindcss/nesting/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const input = path.join(root, "src/koenig-lexical/styles/index.css");
const output = path.join(root, "src/generated/koenig.css");

// Tailwind resolves the config's content globs against the working directory.
process.chdir(root);

const result = await postcss([
  postcssImport(),
  tailwindNesting(),
  tailwindcss({ config: path.join(root, "tailwind.config.cjs") }),
]).process(readFileSync(input, "utf8"), { from: input, to: output });

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, result.css);
console.log(`wrote ${path.relative(root, output)} (${result.css.length} bytes)`);
