// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { reactRouter } from "@react-router/dev/vite";
import {
  brandPublicDirectory,
  buildInfoDefines,
  chooseDevelopmentQuickLogin,
  chooseDevelopmentUiIssueButton,
  sharedAliases,
  testConfig,
} from "@steward-web/vite-config";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

import { BASENAME } from "./app/basename";

export default defineConfig(({ command }) => ({
  // The build's HTML references /admin/assets/..., where the ingress and the server route and
  // resolve them. Build only: React Router's dev server refuses to start unless its `basename`
  // (/admin) begins with `base`, and it serves /admin itself (#45).
  base: command === "build" ? `${BASENAME}/` : undefined,
  define: buildInfoDefines(),
  plugins: [tailwindcss(), reactRouter()],
  publicDir: brandPublicDirectory(),
  resolve: {
    alias: sharedAliases(chooseDevelopmentUiIssueButton(), chooseDevelopmentQuickLogin(command)),
  },
  // Pinned so the documented URLs hold whichever app starts first; a busy port fails
  // instead of moving.
  server: { port: 5174, strictPort: true },
  test: testConfig(import.meta.dirname),
}));
