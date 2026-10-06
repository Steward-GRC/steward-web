// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Config } from "@react-router/dev/config";

import { isMockRun } from "@steward-web/vite-config";

export default {
  // Keeps a `--mode mock` build out of `build/`, so a stray local build never ships by
  // accident and the two can sit side by side during manual testing.
  buildDirectory: isMockRun() ? "build-mock" : "build",
  // Every route is server-rendered (decision: React Router framework mode, not the
  // original's Vite SPA). Loaders and actions run on the server only; see server/.
  ssr: true,
} satisfies Config;
