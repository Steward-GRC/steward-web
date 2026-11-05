// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Config } from "@react-router/dev/config";

export default {
  // Every route is server-rendered (decision: React Router framework mode, not the
  // original's Vite SPA). Loaders and actions run on the server only; see server/.
  ssr: true,
} satisfies Config;
