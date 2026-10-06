// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import {
  ensureTemplateSections,
  missingRequiredSections,
  parseDraftSections,
  scaffoldFromTemplate,
  stringifyDraftSections,
} from "./sections";

const outline = [
  { key: "purpose", level: 1, order: 0, required: true, title: "Purpose" },
  { key: "scope", level: 1, order: 1, required: false, title: "Scope" },
];

describe("parseDraftSections", () => {
  it("parses a stored JSON array", () => {
    const json = stringifyDraftSections([{ sectionKey: "purpose", text: "hi", title: "Purpose" }]);
    expect(parseDraftSections(json)).toEqual([
      { sectionKey: "purpose", text: "hi", title: "Purpose" },
    ]);
  });

  it("answers no sections for null, undefined, empty or malformed content", () => {
    expect(parseDraftSections(null)).toEqual([]);
    expect(parseDraftSections()).toEqual([]);
    expect(parseDraftSections("")).toEqual([]);
    expect(parseDraftSections("{not json")).toEqual([]);
    expect(parseDraftSections('{"not":"an array"}')).toEqual([]);
  });
});

describe("scaffoldFromTemplate", () => {
  it("builds one empty section per template section, in template order", () => {
    expect(scaffoldFromTemplate(outline)).toEqual([
      { sectionKey: "purpose", text: "", title: "Purpose" },
      { sectionKey: "scope", text: "", title: "Scope" },
    ]);
  });

  it("orders by the template's `order`, not array position", () => {
    const reversed = [outline[1]!, outline[0]!];
    expect(scaffoldFromTemplate(reversed).map((s) => s.sectionKey)).toEqual(["purpose", "scope"]);
  });
});

describe("ensureTemplateSections", () => {
  it("keeps already-authored text for a present section", () => {
    const current = [{ sectionKey: "purpose", text: "already written", title: "Purpose" }];
    const result = ensureTemplateSections(current, outline);
    expect(result).toEqual([
      { sectionKey: "purpose", text: "already written", title: "Purpose" },
      { sectionKey: "scope", text: "", title: "Scope" },
    ]);
  });

  it("fills in a template section missing entirely", () => {
    const result = ensureTemplateSections([], outline);
    expect(result.map((s) => s.sectionKey)).toEqual(["purpose", "scope"]);
  });
});

describe("missingRequiredSections", () => {
  it("lists required sections with no non-blank text", () => {
    const sections = [
      { sectionKey: "purpose", text: "  ", title: "Purpose" },
      { sectionKey: "scope", text: "", title: "Scope" },
    ];
    expect(missingRequiredSections(sections, outline)).toEqual(["Purpose"]);
  });

  it("answers empty once every required section has content", () => {
    const sections = [
      { sectionKey: "purpose", text: "filled in", title: "Purpose" },
      { sectionKey: "scope", text: "", title: "Scope" },
    ];
    expect(missingRequiredSections(sections, outline)).toEqual([]);
  });

  it("never flags a section the template doesn't mark required", () => {
    expect(missingRequiredSections([], [outline[1]!])).toEqual([]);
  });
});
