// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createESLintConfig } from "@the-rabbit-hole/eslint-config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

const shared = createESLintConfig({ enable: ["eslintA11y", "eslintTesting"] });

// packages/editor carries a fork of an MIT editor's sources. They keep upstream's own style so
// later upstream fixes can be carried over by hand, so the shared rules skip them. They still
// get a parser and the one rule that matters here: the core never imports a workspace package
// (the Steward adapter included). Code written for the fork (src/additions) is linted as usual.
const editorFork = [
  "packages/editor/src/koenig-lexical/**",
  "packages/editor/src/kg-default-nodes/**",
  "packages/editor/src/kg-default-transforms/**",
  "packages/editor/tailwind.config.cjs",
];
const typescriptParser = shared.find((config) => config.languageOptions?.parser)?.languageOptions
  .parser;
const sharedPlugins = Object.assign({}, ...shared.map((config) => config.plugins ?? {}));
const skipFork = (config) =>
  Object.keys(config).some((key) => key !== "ignores" && key !== "name")
    ? { ...config, ignores: [...(config.ignores ?? []), ...editorFork] }
    : config;

const config = [
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/build-mock/**",
      "**/.react-router/**",
      "**/.docusaurus/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/generated/**",
      ".schemas/**",
    ],
  },
  ...shared,
  // The shared config ignores every folder named lib or docs; ours hold source.
  { ignores: ["!**/src/lib", "!**/src/lib/**", "!**/app/lib", "!**/app/lib/**"] },
  // eslint-plugin-react can't detect the version under ESLint 10, so name it.
  { settings: { react: { version: "19.3" } } },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Route modules export loaders and actions beside the page, and the packages export hooks
      // and helpers beside components; React Router's own HMR handles both.
      "react-refresh/only-export-components": "off",
    },
  },
  // Carried over from the original with its manual cleanup.
  {
    files: ["packages/i18n/src/I18nProvider.test.tsx"],
    rules: { "testing-library/no-manual-cleanup": "off" },
  },
  {
    files: ["scripts/**/*.mjs", "server/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      // Components and their files are PascalCase, modules camelCase, and the workspace folders
      // kebab-case like their package names.
      "unicorn/filename-case": [
        "error",
        { cases: { camelCase: true, kebabCase: true, pascalCase: true } },
      ],
      // Prettier strips the parentheses this rule asks for, so the two can never both pass.
      "unicorn/no-nested-ternary": "off",
      // GraphQL models a missing value as null, and the generated types say so.
      "unicorn/no-null": "off",
      // Names React, Vite and the DOM use as-is.
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            // The gateway schema's own type and operation names (WorkflowDef,
            // WorkflowDefDocument, ...): not renaming what the wire format calls itself.
            Def: true,
            def: true,
            env: true,
            ImportMetaEnv: true,
            Props: true,
            props: true,
            ref: true,
            Ref: true,
          },
        },
      ],
    },
  },
];

const editorCoreImports = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["@steward-web/*"],
          message:
            "The editor core stands alone: Steward code belongs in @steward-web/editor-steward.",
        },
      ],
    },
  ],
};

export default [
  ...config.map((entry) => skipFork(entry)),
  {
    files: editorFork.map((glob) => `${glob}/*.{ts,tsx}`),
    languageOptions: { parser: typescriptParser },
    // Upstream's inline directives name these plugins' rules; load them so the directives resolve.
    linterOptions: { reportUnusedDisableDirectives: "off" },
    plugins: { react: sharedPlugins.react, "react-hooks": reactHooks },
    rules: editorCoreImports,
  },
  { files: ["packages/editor/**/*.{ts,tsx,mjs,js}"], rules: editorCoreImports },
];
