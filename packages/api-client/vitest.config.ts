// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { packageConfig } from "@steward-web/vite-config";
import { defineConfig } from "vitest/config";

export default defineConfig(packageConfig(import.meta.dirname));
