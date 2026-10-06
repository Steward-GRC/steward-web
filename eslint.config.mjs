// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createESLintConfig } from "@the-rabbit-hole/eslint-config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

const shared = createESLintConfig({ enable: ["eslintA11y", "eslintTesting"] });

export default [
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
