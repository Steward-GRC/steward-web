// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { reactRouter } from "@react-router/dev/vite";
import {
  brandPublicDirectory,
  buildInfoDefines,
  chooseDevelopmentQuickLogin,
  chooseDevelopmentUiIssueButton,
  editorPlugins,
  sharedAliases,
  testConfig,
} from "@steward-web/vite-config";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  define: buildInfoDefines(),
  plugins: [tailwindcss(), reactRouter(), ...editorPlugins()],
  publicDir: brandPublicDirectory(),
  resolve: {
    alias: sharedAliases(chooseDevelopmentUiIssueButton(), chooseDevelopmentQuickLogin(command)),
  },
  // Pinned so the documented URLs hold whichever app starts first; a busy port fails
  // instead of moving.
  server: { port: 5174, strictPort: true },
  test: testConfig(import.meta.dirname),
}));
