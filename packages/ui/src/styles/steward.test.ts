// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.join(import.meta.dirname, "steward.css"), "utf8");
const rule = (selector: string) => {
  const escaped = selector.replaceAll(".", String.raw`\.`);
  return new RegExp(String.raw`(^|\n)\s*${escaped}\s*\{([^}]*)\}`).exec(css)?.[2] ?? "";
};

describe("the stored component recipes", () => {
  it("has the serif reading style", () => {
    expect(rule(".doc")).toContain("font-family: var(--font-serif)");
    expect(rule(".doc")).toContain("font-size: var(--text-doc)");
    expect(rule(".doc")).toContain("line-height: var(--text-doc--line-height)");
    expect(rule(".doc h2")).toContain("margin-top: 2.2em");
    expect(rule(".doc h3")).toContain("margin-top: 1.8em");
  });

  it("keeps the loading mark complete: a sweep over it, never a build-up from a part", () => {
    expect(rule(".stw-loader-sheen")).toContain("stw-sheen");
    for (const part of ["fill", "l1", "l2", "rib", "cycle"])
      expect(css).not.toContain(`stw-${part}`);
    expect(css).not.toContain("stw-loader-g");
  });

  it("keeps the reading style full width (decision 2-layout-and-navigation.s9)", () => {
    expect(rule(".doc")).not.toContain("max-width");
  });

  it("has the hatched ink environment banner", () => {
    expect(rule(".env-banner")).toContain(
      "repeating-linear-gradient(135deg, #261b25 0 10px, #3a2d3d 10px 20px)",
    );
    expect(rule(".env-banner")).toContain("color: #f3ecf2");
  });
});

describe("the dialog scrim", () => {
  it("is night plum at 45% in light and black at 65% in dark and high contrast", () => {
    expect(rule(":root")).toContain("--scrim: rgb(29 21 32 / 0.45)");
    expect(rule(".dark")).toContain("--scrim: rgb(0 0 0 / 0.65)");
    expect(rule(".hc")).toContain("--scrim: rgb(0 0 0 / 0.65)");
    expect(css).toMatch(/\.system:not\(\.hc\)\s*\{[^}]*--scrim: rgb\(0 0 0 \/ 0\.65\)/);
  });
});

const channel = (value: number) => {
  const c = value / 255;
  return c <= 4.045 / 100 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (a: string, b: string) => {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const light = (name: string) =>
  new RegExp(String.raw`--${name}:\s*(#[\da-f]{6})`).exec(rule(":root"))?.[1] ?? "";

describe("the light theme's page and card colours", () => {
  it("sets the page on the design's paper, not a darker sand", () => {
    expect(light("background")).toBe("#f8f4ee");
  });

  it("keeps text readable on the page and on the card band: 4.5:1 or better", () => {
    for (const text of ["ink", "muted"]) {
      expect(ratio(light(text), light("background"))).toBeGreaterThanOrEqual(4.5);
      expect(ratio(light(text), light("sunken"))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("draws a card's edge firmly enough to tell it from the page", () => {
    expect(ratio(light("border"), light("background"))).toBeGreaterThanOrEqual(1.8);
    expect(ratio(light("sunken"), light("background"))).toBeGreaterThanOrEqual(1.15);
  });

  it("sets the card band as white on purple, 4.5:1 or better", () => {
    expect(light("band")).toBe("#5d2a5b");
    expect(ratio(light("on-band"), light("band"))).toBeGreaterThanOrEqual(4.5);
  });

  it("draws the card edge at 3:1 against the page so cards stand out", () => {
    expect(ratio(light("card-edge"), light("background"))).toBeGreaterThanOrEqual(3);
  });
});

describe("the card band and edge in the other themes", () => {
  it.each([".dark", ".hc"])("keeps %s band text at 4.5:1 and the edge at 3:1", (selector) => {
    const body = rule(selector);
    const get = (name: string) =>
      new RegExp(String.raw`--${name}:\s*(#[\da-f]{6})`).exec(body)?.[1] ?? "";
    expect(ratio(get("on-band"), get("band"))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(get("card-edge"), get("background"))).toBeGreaterThanOrEqual(3);
  });
});

describe("the amber line colour for the flow view", () => {
  const systemDark = /\.system:not\(\.hc\)\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
  it.each([
    [":root", rule(":root")],
    [".dark", rule(".dark")],
    [".hc", rule(".hc")],
    [".system:not(.hc)", systemDark],
  ])("reaches 3:1 on the page and on the card in %s", (_name, body) => {
    const get = (name: string) =>
      new RegExp(String.raw`--${name}:\s*(#[\da-f]{6})`).exec(body)?.[1] ?? "";
    expect(get("accent-line")).not.toBe("");
    expect(ratio(get("accent-line"), get("background"))).toBeGreaterThanOrEqual(3);
    expect(ratio(get("accent-line"), get("surface"))).toBeGreaterThanOrEqual(3);
  });

  it("is a darker amber than the fill on light, so the fill stays amber", () => {
    expect(light("accent-line")).not.toBe(light("accent"));
  });
});

describe("the active tab in high contrast (#64)", () => {
  it("keeps its underline as a border, since high contrast removes every box-shadow", () => {
    expect(css).toMatch(/\.hc \* \{\s*box-shadow: none !important;/);
    expect(css).toMatch(
      /\.hc \.stw-tab\[data-state="active"\],\s*\.hc \.stw-tab\[aria-current="page"\] \{\s*border-bottom: 3px solid var\(--accent\);/,
    );
  });
});

describe("the editor's selection colour (#72)", () => {
  // The editor draws selected and focused cards, active toolbar buttons and drop lines in
  // `--kg-selection-color`, which Steward sets to the purple primary token.
  const systemDark = /\.system:not\(\.hc\)\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
  it.each([
    [":root", rule(":root")],
    [".dark", rule(".dark")],
    [".hc", rule(".hc")],
    [".system:not(.hc)", systemDark],
  ])("reaches 3:1 on the page and on the card in %s", (_name, body) => {
    const get = (name: string) =>
      new RegExp(String.raw`--${name}:\s*(#[\da-f]{6})`).exec(body)?.[1] ?? "";
    expect(get("primary")).not.toBe("");
    expect(ratio(get("primary"), get("background"))).toBeGreaterThanOrEqual(3);
    expect(ratio(get("primary"), get("surface"))).toBeGreaterThanOrEqual(3);
  });

  it("keeps highlighted text dark in every theme (bug log 168)", () => {
    expect(css).toMatch(
      /\.koenig-lexical \[style\*="background-color: #fff59d" i\][^{]*\{[^}]*color: #261b25/,
    );
    expect(ratio("#261b25", "#fff59d")).toBeGreaterThanOrEqual(7);
  });

  it("draws an upload refusal as Steward's danger notice, from its tokens (bug log 195)", () => {
    // the image card's placeholder and the file card's alert paragraph share one rule
    const refusal =
      /\.koenig-lexical \[data-kg-upload-error\],\s*\.koenig-lexical \[data-kg-card\] p\[role="alert"\]\s*\{([^}]*)\}/.exec(
        css,
      )?.[1] ?? "";
    expect(refusal).toContain("var(--color-danger-soft)");
    expect(refusal).toContain("var(--color-danger)");
    expect(refusal).toContain("var(--color-foreground)");
    expect(refusal).not.toMatch(/#[\da-f]{3,6}/i);
  });

  it("keeps a visible outline on selected cards in high contrast, where shadows are off", () => {
    expect(css).toMatch(/\.hc \.koenig-lexical[^{]*\{[^}]*outline/);
  });
});

describe("the text on amber (bug log 62, #217)", () => {
  const systemDark = /\.system:not\(\.hc\)\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
  it.each([
    [":root", rule(":root"), 4.5],
    [".dark", rule(".dark"), 4.5],
    [".hc", rule(".hc"), 7],
    [".system:not(.hc)", systemDark, 4.5],
  ])("is white on a darker amber fill that passes contrast in %s", (_name, body, least) => {
    const get = (name: string) =>
      new RegExp(String.raw`--${name}:\s*(#[\da-f]{6})`).exec(body)?.[1] ?? "";
    expect(get("on-accent")).toBe("#ffffff");
    expect(get("accent-fill")).not.toBe("");
    expect(ratio(get("on-accent"), get("accent-fill"))).toBeGreaterThanOrEqual(least);
  });

  it("keeps the bright amber for the places with no text on them", () => {
    expect(rule(":root")).toContain("--accent: #e2a336");
    expect(rule(".hc")).toContain("--accent: #ffd23f");
  });

  it("only puts text-on-accent on the text-safe fill, never on the bright amber", () => {
    const root = path.join(import.meta.dirname, "../../../..");
    const hits: string[] = [];
    const walk = (directory: string) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if ([".git", "build", "dist", "node_modules"].includes(entry.name)) continue;
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".tsx") && !/\.test\./.test(entry.name)) {
          const text = readFileSync(full, "utf8");
          if (text.includes("text-on-accent") && /bg-accent(?!-)/.test(text)) hits.push(full);
        }
      }
    };
    walk(path.join(root, "packages"));
    walk(path.join(root, "apps"));
    expect(hits).toEqual([]);
  });
});

describe("table rows (#105, #112)", () => {
  const systemDark = /\.system:not\(\.hc\)\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
  it.each([
    [":root", rule(":root")],
    [".dark", rule(".dark")],
    [".hc", rule(".hc")],
    [".system:not(.hc)", systemDark],
  ])(
    "has a stripe shade that keeps row text at 3:1 or better, and apart from the row in %s",
    (_name, body) => {
      const get = (name: string) =>
        new RegExp(String.raw`--${name}:\s*(#[\da-f]{6})`).exec(body)?.[1] ?? "";
      expect(get("stripe")).not.toBe("");
      expect(get("stripe")).not.toBe(get("surface"));
      expect(ratio(get("ink"), get("stripe"))).toBeGreaterThanOrEqual(3);
      expect(ratio(get("ink"), get("surface"))).toBeGreaterThanOrEqual(3);
      // Muted text is read on the stripe too.
      expect(ratio(get("muted"), get("stripe"))).toBeGreaterThanOrEqual(3);
    },
  );
});
