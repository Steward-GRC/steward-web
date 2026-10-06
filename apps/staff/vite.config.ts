// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { reactRouter } from "@react-router/dev/vite";
import {
  buildInfoDefines,
  chooseDevelopmentUiIssueButton,
  chooseEdge,
  editorPlugins,
  sharedAliases,
  testConfig,
} from "@steward-web/vite-config";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  define: buildInfoDefines(),
  plugins: [tailwindcss(), reactRouter(), ...editorPlugins()],
  resolve: { alias: sharedAliases(chooseEdge(mode), chooseDevelopmentUiIssueButton()) },
  test: testConfig(import.meta.dirname),
}));
