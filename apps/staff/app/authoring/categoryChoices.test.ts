// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { categoryChoices } from "./categoryChoices";

const group = (id: string, name: string, parentId: null | string = null) =>
  ({ id, name, parentId, slug: name.toLowerCase() }) as never;

const typed = (id: string, name: string, parentId: null | string, documentTypes: string) =>
  ({ documentTypes, id, name, parentId, slug: name.toLowerCase() }) as never;

describe("categoryChoices document types (#87)", () => {
  it("carries what each group holds, on categories and subcategories", () => {
    expect(
      categoryChoices([
        typed("w", "Workplace", null, "NONE"),
        typed("f", "Facilities", "w", "POLICIES"),
      ]),
    ).toEqual([
      {
        documentTypes: "NONE",
        id: "w",
        name: "Workplace",
        slug: "workplace",
        subcategories: [
          { documentTypes: "POLICIES", id: "f", name: "Facilities", path: ["facilities"] },
        ],
      },
    ]);
  });
});

describe("categoryChoices", () => {
  it("makes the top groups categories and their children subcategories", () => {
    expect(
      categoryChoices([
        group("w", "Workplace"),
        group("f", "Facilities", "w"),
        group("t", "Travel", "w"),
        group("p", "People"),
      ]),
    ).toEqual([
      {
        id: "w",
        name: "Workplace",
        slug: "workplace",
        subcategories: [
          { id: "f", name: "Facilities", path: ["facilities"] },
          { id: "t", name: "Travel", path: ["travel"] },
        ],
      },
      { id: "p", name: "People", slug: "people", subcategories: [] },
    ]);
  });

  it("treats a group whose parent the author can't use as a category of its own", () => {
    expect(categoryChoices([group("f", "Facilities", "hidden")])).toEqual([
      { id: "f", name: "Facilities", slug: "facilities", subcategories: [] },
    ]);
  });

  it("names deeper groups by their path under the subcategory", () => {
    const choices = categoryChoices([
      group("w", "Workplace"),
      group("f", "Facilities", "w"),
      group("d", "Desks", "f"),
    ]);
    expect(choices[0]!.subcategories).toEqual([
      { id: "f", name: "Facilities", path: ["facilities"] },
      { id: "d", name: "Facilities › Desks", path: ["facilities", "desks"] },
    ]);
  });

  it("carries each group's slug, and a subcategory's slug path below its category (#377)", () => {
    const [workplace] = categoryChoices([
      { ...(group("w", "Workplace") as object), slug: "workplace-it" } as never,
      { ...(group("f", "Facilities", "w") as object), slug: "facilities" } as never,
      { ...(group("d", "Desks", "f") as object), slug: "desks" } as never,
    ]);
    expect(workplace?.slug).toBe("workplace-it");
    expect(workplace?.subcategories.map((s) => s.path)).toEqual([
      ["facilities"],
      ["facilities", "desks"],
    ]);
  });
});

const withDefault = (
  id: string,
  name: string,
  parentId: null | string,
  defaults: {
    defaultTemplateId?: string;
    defaultTemplateLocked?: boolean;
    defaultTemplateNone?: boolean;
  },
) => ({ defaultTemplateNone: false, id, name, parentId, ...defaults }) as never;

describe("categoryChoices default templates (bug log 210)", () => {
  it("carries a category's default template, and a subcategory inherits its parent's", () => {
    const [finance] = categoryChoices([
      withDefault("fin", "Finance", null, { defaultTemplateId: "tpl-1" }),
      withDefault("exp", "Expenses", "fin", {}),
    ]);
    expect(finance?.defaultTemplateId).toBe("tpl-1");
    expect(finance?.subcategories[0]?.defaultTemplateId).toBe("tpl-1");
  });

  it("lets a subcategory have its own default over its parent's", () => {
    const [finance] = categoryChoices([
      withDefault("fin", "Finance", null, { defaultTemplateId: "tpl-1" }),
      withDefault("exp", "Expenses", "fin", { defaultTemplateId: "tpl-2" }),
    ]);
    expect(finance?.subcategories[0]?.defaultTemplateId).toBe("tpl-2");
  });

  it("says freeform where the category is set to no template, and stops inheriting there", () => {
    const [phones] = categoryChoices([
      withDefault("dev", "Devices", null, { defaultTemplateId: "tpl-2" }),
      withDefault("ph", "Phones", "dev", { defaultTemplateNone: true }),
    ]);
    expect(phones?.defaultTemplateId).toBe("tpl-2");
    expect(phones?.subcategories[0]).toMatchObject({ defaultTemplateNone: true });
    expect(phones?.subcategories[0]?.defaultTemplateId).toBeUndefined();
  });

  it("has no default where nothing in the chain sets one", () => {
    const [people] = categoryChoices([withDefault("ppl", "People", null, {})]);
    expect(people?.defaultTemplateId).toBeUndefined();
    expect(people?.defaultTemplateNone).toBeUndefined();
  });
});

describe("categoryChoices template lock (steward-web#262)", () => {
  it("carries the lock of the category that sets the template, to its subcategories too", () => {
    const [finance] = categoryChoices([
      withDefault("fin", "Finance", null, {
        defaultTemplateId: "tpl-1",
        defaultTemplateLocked: true,
      }),
      withDefault("exp", "Expenses", "fin", {}),
    ]);
    expect(finance?.templateLocked).toBe(true);
    expect(finance?.subcategories[0]).toMatchObject({
      defaultTemplateId: "tpl-1",
      templateLocked: true,
    });
  });

  it("is not locked by a parent's lock once the subcategory sets its own template", () => {
    const [finance] = categoryChoices([
      withDefault("fin", "Finance", null, {
        defaultTemplateId: "tpl-1",
        defaultTemplateLocked: true,
      }),
      withDefault("exp", "Expenses", "fin", { defaultTemplateId: "tpl-2" }),
    ]);
    expect(finance?.subcategories[0]?.templateLocked).toBeUndefined();
  });

  it("is not locked where nothing locks", () => {
    const [people] = categoryChoices([
      withDefault("ppl", "People", null, { defaultTemplateId: "tpl-1" }),
    ]);
    expect(people?.templateLocked).toBeUndefined();
  });
});
