// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { checkRows, CSV_TEMPLATE, parseCsv, readImportFile } from "./csvImport";

const categories = [
  {
    id: "w",
    name: "Workplace",
    subcategories: [
      { id: "f", name: "Facilities" },
      { id: "t", name: "Travel" },
    ],
  },
  { id: "p", name: "People", subcategories: [] },
];
const templates = [{ id: "tpl-1", name: "Standard Policy" }];

describe("parseCsv", () => {
  it("reads quoted fields, escaped quotes, commas and line breaks inside quotes", () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi""\nthere"\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"\nthere'],
    ]);
  });

  it("drops a byte-order mark and blank lines", () => {
    expect(parseCsv(`${String.fromCodePoint(65_279)}title\n\nKitchen\n`)).toEqual([
      ["title"],
      ["Kitchen"],
    ]);
  });
});

describe("readImportFile", () => {
  it("reads the columns by header, in any order and case", () => {
    const file = readImportFile("Category,TITLE,type\nWorkplace,Kitchen Use Policy,procedure\n");
    expect(file).toEqual({
      ok: true,
      rows: [
        {
          category: "Workplace",
          line: 1,
          sensitivity: "",
          subcategory: "",
          template: "",
          title: "Kitchen Use Policy",
          type: "procedure",
        },
      ],
    });
  });

  it("says when the title or category column is missing", () => {
    expect(readImportFile("name,category\nx,y\n")).toEqual({ missing: ["title"], ok: false });
    expect(readImportFile("")).toEqual({ missing: ["title", "category"], ok: false });
  });

  it("matches the CSV template's own columns", () => {
    const file = readImportFile(CSV_TEMPLATE);
    expect(file.ok).toBe(true);
  });
});

const row = (fields: Partial<Record<string, string>>, line = 1) => ({
  category: "",
  line,
  sensitivity: "",
  subcategory: "",
  template: "",
  title: "",
  type: "",
  ...fields,
});

describe("checkRows", () => {
  it("makes a ready row into the create input, matching names without regard to case", () => {
    const [checked] = checkRows(
      [
        row({
          category: "workplace",
          sensitivity: "Sensitive",
          subcategory: "facilities",
          template: "standard policy",
          title: "Kitchen Use Policy",
          type: "Procedure",
        }),
      ],
      categories,
      templates,
    );
    expect(checked).toEqual({
      category: "Workplace",
      input: {
        documentType: "PROCEDURE",
        homeGroupId: "f",
        sensitivity: "SENSITIVE",
        templateId: "tpl-1",
        title: "Kitchen Use Policy",
      },
      issues: [],
      line: 1,
      title: "Kitchen Use Policy",
    });
  });

  it("defaults to a standard policy with no template, filed under the category", () => {
    const [checked] = checkRows(
      [row({ category: "People", title: "Leave" })],
      categories,
      templates,
    );
    expect(checked?.input).toEqual({
      documentType: "POLICY",
      homeGroupId: "p",
      sensitivity: "STANDARD",
      templateId: null,
      title: "Leave",
    });
  });

  it("lists each issue a row has", () => {
    const checked = checkRows(
      [
        row({ category: "People" }, 1),
        row({ category: "Operations", title: "Hybrid Work Policy" }, 2),
        row({ category: "Workplace", subcategory: "Garden", title: "Plants" }, 3),
        row({ category: "People", template: "Odd", title: "A", type: "memo" }, 4),
        row({ category: "People", sensitivity: "secret", title: "B" }, 5),
      ],
      categories,
      templates,
    );
    expect(checked.map((c) => c.issues)).toEqual([
      [{ kind: "missingTitle" }],
      [{ kind: "unknownCategory", value: "Operations" }],
      [{ kind: "unknownSubcategory", value: "Garden" }],
      [
        { kind: "unknownType", value: "memo" },
        { kind: "unknownTemplate", value: "Odd" },
      ],
      [{ kind: "unknownSensitivity", value: "secret" }],
    ]);
    expect(checked.every((c) => c.input === null)).toBe(true);
  });

  it("flags a title used twice in the file", () => {
    const checked = checkRows(
      [
        row({ category: "People", title: "Leave" }, 1),
        row({ category: "People", title: "leave" }, 2),
      ],
      categories,
      templates,
    );
    expect(checked[1]?.issues).toEqual([{ kind: "duplicateTitle" }]);
    expect(checked[0]?.issues).toEqual([]);
  });

  it("asks for a category when there's none", () => {
    const [checked] = checkRows([row({ title: "Leave" })], categories, templates);
    expect(checked?.issues).toEqual([{ kind: "missingCategory" }]);
  });
});
