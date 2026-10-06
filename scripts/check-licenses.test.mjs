import { describe, expect, it } from "vitest";

import { licenceAllowed } from "./check-licenses.mjs";

describe("licenceAllowed", () => {
  it("allows a listed licence, the font licence included", () => {
    expect(licenceAllowed("MIT")).toBe(true);
    expect(licenceAllowed("OFL-1.1")).toBe(true);
  });

  it("refuses an unlisted licence", () => {
    expect(licenceAllowed("GPL-3.0-only")).toBe(false);
    expect(licenceAllowed("UNKNOWN")).toBe(false);
  });

  it("reads OR as either and AND as both", () => {
    expect(licenceAllowed("(MIT OR GPL-3.0-only)")).toBe(true);
    expect(licenceAllowed("MIT AND GPL-3.0-only")).toBe(false);
    expect(licenceAllowed("(MIT AND Apache-2.0)")).toBe(true);
  });
});
