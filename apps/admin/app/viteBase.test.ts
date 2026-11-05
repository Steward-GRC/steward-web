// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// React Router's dev server refuses to start unless its `basename` begins with Vite's `base`
// (#45), while the production build has to emit /admin/assets/... for the server and ingress.
import type { UserConfig, UserConfigFnObject } from "vite";

import { describe, expect, it } from "vitest";

import viteConfig from "../vite.config";
import { BASENAME } from "./basename";

const resolve = (command: "build" | "serve") =>
  (viteConfig as UserConfigFnObject)({ command, mode: "test" }) as UserConfig;

describe("admin's Vite base", () => {
  it("lets the dev server start: the basename begins with the base", () => {
    const base = resolve("serve").base ?? "/";
    expect(BASENAME.startsWith(base)).toBe(true);
  });

  it("builds the assets under the admin prefix", () => {
    expect(resolve("build").base).toBe(`${BASENAME}/`);
  });
});
