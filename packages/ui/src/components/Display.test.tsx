import { describe, expect, it } from "vitest";

import { initialsOf } from "./Display";

describe("initialsOf", () => {
  it("takes the first and last name's first letters", () => {
    expect(initialsOf("Erin Example")).toBe("EE");
    expect(initialsOf("  carol   de la Cruz ")).toBe("CC");
  });

  it("copes with one word and with nothing", () => {
    expect(initialsOf("alice")).toBe("A");
    expect(initialsOf(" ".repeat(3))).toBe("?");
  });
});
