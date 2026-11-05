// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { buildInfo, buildInfoDefines, chooseDevelopmentQuickLogin, sharedAliases } from "./index";

describe("sharedAliases", () => {
  it("points every app at the live gateway client: mock data comes from the mock server", () => {
    const aliases = sharedAliases();
    expect(aliases["@steward-web/edge.server"]).toMatch(/api-client.*edge\/live\.server\.ts$/);
    expect(Object.keys(aliases).filter((name) => /mock/i.test(name))).toEqual([]);
  });
});

describe("buildInfo", () => {
  it("takes the version and commit from the VERSION and COMMIT build arguments", () => {
    expect(buildInfo({ COMMIT: "0123456789abcdef", VERSION: "v0.1.0" })).toEqual({
      commit: "0123456789abcdef",
      version: "v0.1.0",
    });
  });

  it("reports dev and unknown when the build isn't stamped", () => {
    expect(buildInfo({})).toEqual({ commit: "unknown", version: "dev" });
    expect(buildInfo({ COMMIT: " ", VERSION: "" })).toEqual({ commit: "unknown", version: "dev" });
  });

  it("defines both as string constants for the bundle", () => {
    expect(buildInfoDefines({ COMMIT: "abc", VERSION: "v1.2.3" })).toEqual({
      __STEWARD_COMMIT__: JSON.stringify("abc"),
      __STEWARD_VERSION__: JSON.stringify("v1.2.3"),
    });
  });
});

describe("chooseDevelopmentQuickLogin", () => {
  it("allows the quick login for the dev server", () => {
    const choice = chooseDevelopmentQuickLogin("serve", {});
    expect(choice.enabled).toBe(true);
    expect(choice.module).toMatch(/auth.*developmentQuickLogin\.server\.ts$/);
    expect(choice.component).toMatch(/auth.*QuickLogin\.tsx$/);
  });

  it("leaves it out of a production build unless the build asks for it", () => {
    const release = chooseDevelopmentQuickLogin("build", {});
    expect(release.enabled).toBe(false);
    expect(release.module).toMatch(/NoDevelopmentQuickLogin\.server\.ts$/);
    expect(release.component).toMatch(/NoQuickLogin\.tsx$/);
    expect(
      chooseDevelopmentQuickLogin("build", { STEWARD_DEV_QUICK_LOGIN_BUILD: "true" })
        .enabled,
    ).toBe(true);
    expect(
      chooseDevelopmentQuickLogin("build", { STEWARD_DEV_QUICK_LOGIN_BUILD: "1" })
        .enabled,
    ).toBe(false);
  });
});

describe("buildInfo commit fallback", () => {
  it("falls back to GITHUB_SHA when the COMMIT build argument is unset", () => {
    expect(buildInfo({ GITHUB_SHA: "fedcba9876543210" }).commit).toBe("fedcba9876543210");
    expect(buildInfo({ COMMIT: "0123456789abcdef", GITHUB_SHA: "fedcba9876543210" }).commit).toBe(
      "0123456789abcdef",
    );
  });
});
