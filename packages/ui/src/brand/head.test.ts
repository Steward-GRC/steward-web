// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { brandLinks, brandMeta } from "./head";

const BRAND_PUBLIC_DIR = path.join(import.meta.dirname, "../../public");

describe("brandLinks", () => {
  it("links the designed favicons, touch icon and web manifest", () => {
    expect(brandLinks()).toEqual([
      { href: "/favicon.ico", rel: "icon", sizes: "48x48" },
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      { href: "/apple-touch-icon.png", rel: "apple-touch-icon" },
      { href: "/site.webmanifest", rel: "manifest" },
    ]);
  });

  it("serves them under the app's base path", () => {
    expect(brandLinks("/admin/").map((link) => link.href)).toEqual([
      "/admin/favicon.ico",
      "/admin/favicon.svg",
      "/admin/apple-touch-icon.png",
      "/admin/site.webmanifest",
    ]);
  });

  it("points at files that exist in the shared public folder", () => {
    for (const link of brandLinks()) {
      expect(existsSync(path.join(BRAND_PUBLIC_DIR, link.href))).toBe(true);
    }
    for (const icon of [
      "icon-192.png",
      "icon-512.png",
      "icon-maskable-192.png",
      "icon-maskable-512.png",
    ]) {
      expect(existsSync(path.join(BRAND_PUBLIC_DIR, icon))).toBe(true);
    }
  });

  it("keeps the favicon's switch to lilac in dark browser chrome", () => {
    const svg = readFileSync(path.join(BRAND_PUBLIC_DIR, "favicon.svg"), "utf8");
    expect(svg).toContain("#5D2A5B");
    expect(svg).toMatch(/prefers-color-scheme:\s*dark[^}]*\{[^}]*#D9A6D2/);
  });
});

describe("brandMeta", () => {
  it("sets the plum theme colour, and night in dark mode", () => {
    expect(brandMeta()).toEqual([
      { content: "#5D2A5B", media: "(prefers-color-scheme: light)", name: "theme-color" },
      { content: "#1D1520", media: "(prefers-color-scheme: dark)", name: "theme-color" },
    ]);
  });
});
