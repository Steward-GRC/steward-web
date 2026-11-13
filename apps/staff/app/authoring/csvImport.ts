// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Import from CSV (Authoring U21): reading the file and checking each row against the
// categories and templates the author may use, before anything is created. The gateway has no
// import operation yet (steward-gateway#75), so a ready row becomes one `createPolicy` call.
import { DocumentType, Sensitivity } from "@steward-web/api-client";

import type { CategoryChoice } from "./categoryChoices";

const COLUMNS = ["title", "category", "subcategory", "type", "sensitivity", "template"] as const;
type Column = (typeof COLUMNS)[number];
const REQUIRED: Column[] = ["title", "category"];

/** The "CSV template" download: the columns, then one example row. */
export const CSV_TEMPLATE = `${COLUMNS.join(",")}\nKitchen Use Policy,Workplace,Facilities,policy,standard,\n`;

/** RFC 4180 CSV: quoted fields with doubled quotes, commas and line breaks inside quotes. */
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const BOM = String.fromCodePoint(65_279);
  const source = text.startsWith(BOM) ? text.slice(BOM.length) : text;
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!;
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    switch (char) {
      case "\n":
      case "\r": {
        if (char === "\r" && source[index + 1] === "\n") index++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        break;
      }
      case ",": {
        row.push(field);
        field = "";
        break;
      }
      case '"': {
        quoted = true;
        break;
      }
      default: {
        field += char;
      }
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
};

export type ImportFile = { missing: Column[]; ok: false } | { ok: true; rows: ImportRow[] };

export type ImportRow = { line: number } & Record<Column, string>;

/** The file's rows by its header's column names, in any order and case. */
export const readImportFile = (text: string): ImportFile => {
  const [header = [], ...body] = parseCsv(text);
  const names = header.map((name) => name.trim().toLowerCase());
  const missing = REQUIRED.filter((column) => !names.includes(column));
  if (missing.length > 0) return { missing, ok: false };
  const at = (cells: string[], column: Column) => {
    const index = names.indexOf(column);
    return index === -1 ? "" : (cells[index] ?? "").trim();
  };
  return {
    ok: true,
    rows: body.map((cells, index) => ({
      category: at(cells, "category"),
      line: index + 1,
      sensitivity: at(cells, "sensitivity"),
      subcategory: at(cells, "subcategory"),
      template: at(cells, "template"),
      title: at(cells, "title"),
      type: at(cells, "type"),
    })),
  };
};

export interface CheckedRow {
  category: string;
  /** What `createPolicy` takes for a ready row; null while it has issues. */
  input: {
    documentType: DocumentType;
    homeGroupId: string;
    sensitivity: Sensitivity;
    templateId: null | string;
    title: string;
  } | null;
  issues: RowIssue[];
  line: number;
  title: string;
}

export type RowIssue =
  | { kind: "duplicateTitle" | "missingCategory" | "missingTitle" }
  | {
      kind:
        | "unknownCategory"
        | "unknownSensitivity"
        | "unknownSubcategory"
        | "unknownTemplate"
        | "unknownType";
      value: string;
    };

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const TYPES: Record<string, DocumentType> = {
  policy: DocumentType.Policy,
  procedure: DocumentType.Procedure,
};
const SENSITIVITIES: Record<string, Sensitivity> = {
  sensitive: Sensitivity.Sensitive,
  standard: Sensitivity.Standard,
};

/** The categories a row is checked against: matched by name, so no address slugs are needed. */
type ImportCategory = {
  subcategories: readonly Omit<CategoryChoice["subcategories"][number], "path">[];
} & Omit<CategoryChoice, "slug" | "subcategories">;

/** Each row checked against the categories and templates the author may use. */
export const checkRows = (
  rows: readonly ImportRow[],
  categories: readonly ImportCategory[],
  templates: readonly { id: string; name: string }[],
): CheckedRow[] => {
  const seen = new Set<string>();
  return rows.map((row) => {
    const issues: RowIssue[] = [];
    if (!row.title) issues.push({ kind: "missingTitle" });
    else if (seen.has(row.title.toLowerCase())) issues.push({ kind: "duplicateTitle" });
    if (row.title) seen.add(row.title.toLowerCase());

    const category = categories.find((choice) => same(choice.name, row.category));
    if (!row.category) issues.push({ kind: "missingCategory" });
    else if (!category) issues.push({ kind: "unknownCategory", value: row.category });
    const subcategory = row.subcategory
      ? category?.subcategories.find((choice) => same(choice.name, row.subcategory))
      : undefined;
    if (category && row.subcategory && !subcategory) {
      issues.push({ kind: "unknownSubcategory", value: row.subcategory });
    }

    const type = row.type ? TYPES[row.type.toLowerCase()] : DocumentType.Policy;
    if (!type) issues.push({ kind: "unknownType", value: row.type });
    const sensitivity = row.sensitivity
      ? SENSITIVITIES[row.sensitivity.toLowerCase()]
      : Sensitivity.Standard;
    if (!sensitivity) issues.push({ kind: "unknownSensitivity", value: row.sensitivity });
    const template = row.template
      ? templates.find((choice) => same(choice.name, row.template))
      : undefined;
    if (row.template && !template) issues.push({ kind: "unknownTemplate", value: row.template });

    const ready = issues.length === 0 && category && type && sensitivity;
    return {
      category: category?.name ?? row.category,
      input: ready
        ? {
            documentType: type,
            homeGroupId: subcategory?.id ?? category.id,
            sensitivity,
            templateId: template?.id ?? null,
            title: row.title,
          }
        : null,
      issues,
      line: row.line,
      title: row.title,
    };
  });
};
