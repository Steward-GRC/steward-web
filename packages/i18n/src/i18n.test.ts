// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { currentLocale, i18n } from "./i18n";
import { NAMESPACES } from "./locales";
import { resources } from "./resources";

describe("the i18n singleton", () => {
  it("is already initialized by import alone", () => {
    // The load-bearing property: shared packages, Storybook stories and vitest
    // suites get working translations without any bootstrapping. If this ever
    // becomes async, every consumer needs a Suspense boundary.
    expect(i18n.isInitialized).toBe(true);
    expect(currentLocale()).toBe("en");
  });

  it("registers every declared namespace", () => {
    for (const ns of NAMESPACES) expect(i18n.hasResourceBundle("en", ns)).toBe(true);
  });

  it("ships a catalog file for every namespace and no orphans", () => {
    // Guards the drift that would otherwise only show up as a missing string
    // in production: a name in NAMESPACES with no JSON file, or vice versa.
    expect(Object.keys(resources.en).toSorted()).toEqual([...NAMESPACES].toSorted());
  });

  it("resolves a regional request onto the base catalog", () => {
    // load: "languageOnly" — "en-GB" must find the "en" bundle, not 404.
    const fixed = i18n.getFixedT("en-GB", "settings");
    expect(fixed("profile.title")).toBe("Your profile");
  });

  it("returns real copy for the converted reference area", () => {
    const t = i18n.getFixedT("en", "settings");
    expect(t("profile.title")).toBe("Your profile");
    expect(t("profile.tabs.preferences")).toBe("Preferences");
    expect(t("profile.name.firstNameLabel")).toBe("First name");
    expect(i18n.getFixedT("en", "common")("actions.save")).toBe("Save");
  });

  it("interpolates without HTML-escaping the value", () => {
    // interpolation.escapeValue is false because React escapes on render;
    // leaving i18next's escaping on double-encodes apostrophes in names.
    const t = i18n.getFixedT("en", "settings");
    expect(t("profile.name.preview", { displayName: "O'Brien & Co" })).toContain("O'Brien & Co");
  });
});
