// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["*.test.mjs"],
    name: "scripts",
    root: import.meta.dirname,
  },
});
