import { describe, expect, it } from "vitest";

import { negotiateLocale, resolveLocale } from "./resolveLocale";

describe("negotiateLocale", () => {
  it("matches a shipped tag exactly, case-insensitively", () => {
    expect(negotiateLocale("en")).toBe("en");
    expect(negotiateLocale("EN")).toBe("en");
    expect(negotiateLocale("  en  ")).toBe("en");
  });

  it("falls back from a regional tag to the shipped base language", () => {
    // The whole reason we ship "en" rather than "en-US": every English region
    // has to resolve, not just the one we happened to name.
    expect(negotiateLocale("en-US")).toBe("en");
    expect(negotiateLocale("en-GB")).toBe("en");
    expect(negotiateLocale("en-AU")).toBe("en");
  });

  it("returns undefined for a language we ship no catalog for", () => {
    // Must fall THROUGH to the next precedence step, not select a locale with
    // no catalog behind it.
    expect(negotiateLocale("fr")).toBeUndefined();
    expect(negotiateLocale("de-DE")).toBeUndefined();
  });

  it("rejects malformed tags instead of passing them to Intl", () => {
    // Intl THROWS a RangeError on an invalid tag, so a junk value in the
    // database or localStorage must never reach the formatters.
    for (const junk of [
      "",
      " ".repeat(3),
      "e",
      "english!",
      "en_US",
      "../../etc/passwd",
      "en-",
      "123",
    ])
      expect(negotiateLocale(junk)).toBeUndefined();
  });

  it("ignores null and undefined", () => {
    // Both arrive in practice: `null` from the gateway for an unset preference,
    // `undefined` from localStorage before any choice is made.
    expect(negotiateLocale(null)).toBeUndefined();
    expect(negotiateLocale()).toBeUndefined();
  });
});

describe("resolveLocale precedence", () => {
  it("prefers the user's stored account preference above all else", () => {
    expect(
      resolveLocale({
        browserLocales: ["en-GB"],
        storedLocale: "en-AU",
        userLocale: "en-US",
      }),
    ).toEqual({ locale: "en", source: "user" });
  });

  it("falls back to this browser's explicit choice when there is no user", () => {
    // The pre-auth case: sign-in and magic-link screens have no identity yet.
    expect(resolveLocale({ browserLocales: ["en-GB"], storedLocale: "en" })).toEqual({
      locale: "en",
      source: "stored",
    });
  });

  it("falls back to Accept-Language when nothing explicit is set", () => {
    expect(resolveLocale({ browserLocales: ["en-GB"] })).toEqual({
      locale: "en",
      source: "browser",
    });
  });

  it("walks the browser list in the user's own priority order", () => {
    // navigator.languages is ordered; the first SUPPORTED entry wins, and
    // unsupported leading entries must be skipped rather than aborting.
    expect(resolveLocale({ browserLocales: ["fr-FR", "de", "en-CA"] })).toEqual({
      locale: "en",
      source: "browser",
    });
  });

  it("defaults to en when nothing resolves", () => {
    expect(resolveLocale({})).toEqual({ locale: "en", source: "default" });
    expect(resolveLocale()).toEqual({ locale: "en", source: "default" });
    expect(resolveLocale({ browserLocales: ["fr", "de"] })).toEqual({
      locale: "en",
      source: "default",
    });
  });

  it("skips an unsupported preference rather than honouring it", () => {
    // A user whose account says "fr" while only "en" ships must get English,
    // and the source must report `browser` so the UI can explain why.
    expect(resolveLocale({ browserLocales: ["en-GB"], userLocale: "fr" })).toEqual({
      locale: "en",
      source: "browser",
    });
  });

  it("treats identity's empty-string sentinel as unset", () => {
    // identity's users.locale is `TEXT NOT NULL DEFAULT ''`, so "" means
    // "never chosen" and must not shadow the browser's preference.
    expect(resolveLocale({ browserLocales: ["en-GB"], userLocale: "" })).toEqual({
      locale: "en",
      source: "browser",
    });
  });
});
