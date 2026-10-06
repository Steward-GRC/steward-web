// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from "vitest/config";

// A plain Node environment, not the shared packageConfig's jsdom: the server never touches
// the DOM.
export default defineConfig({
  test: { environment: "node", globals: true, include: ["src/**/*.test.ts"] },
});
