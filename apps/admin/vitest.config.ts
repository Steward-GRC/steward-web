// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A dedicated Vitest config, separate from vite.config.ts: the React Router dev plugin there
// refuses to let a `.server.ts` module be imported from outside a route module (its
// server/client code-splitting guard), which a vitest run of this app's own `*.server.ts`
// business logic would trip. Vitest prefers this file over vite.config.ts when both exist, so
// `vite dev`/`react-router build` still get the real plugin and this file only shapes tests.
import { packageConfig } from "@steward-web/vite-config";
import { defineConfig } from "vitest/config";

export default defineConfig(packageConfig(import.meta.dirname));
