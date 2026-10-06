// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ContactBlock, DefinitionEntry, Reference } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createContactBlock,
  createDefinition,
  createReference,
  deleteDefinition,
  deleteReference,
  listContactBlocks,
  listDefinitions,
  listReferences,
  setContactBlockArchived,
  setDefinitionArchived,
  setReferenceArchived,
  updateContactBlock,
  updateDefinition,
  updateReference,
} from "./libraries.server";

const readerMe = {
  email: "reader@example.com",
  id: "u-reader",
  managedGroupIds: [],
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  username: "reader",
};

const jsonOnce = (data: unknown) => Response.json({ data });

const request = () => new Request("https://admin.steward.example/contact-library");

const makeContactBlock = (overrides: Partial<ContactBlock> = {}): ContactBlock => ({
  archived: false,
  department: null,
  email: "help@example.com",
  hours: null,
  id: "cb-1",
  label: "Help desk",
  name: null,
  notes: null,
  phone: null,
  role: null,
  usedByCount: 0,
  ...overrides,
});

const makeReference = (overrides: Partial<Reference> = {}): Reference =>
  ({
    archived: false,
    body: null,
    clause: null,
    createdByUserId: "u-reader",
    id: "ref-1",
    kind: "LINK",
    label: "Vendor portal",
    url: "https://example.org/vendor",
    usedByCount: 0,
    ...overrides,
  }) as Reference;

const makeDefinition = (overrides: Partial<DefinitionEntry> = {}): DefinitionEntry => ({
  archived: false,
  categoryId: "group-1",
  createdByUserId: "u-reader",
  definition: "A planned, temporary gap in service.",
  id: "def-1",
  term: "Maintenance window",
  usedByCount: 0,
  ...overrides,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listContactBlocks", () => {
  it("redirects a signed-out caller", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: null })));
    const thrown: unknown = await listContactBlocks(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
  });

  it("lists every block, active and archived, for any signed-in viewer", async () => {
    const block = makeContactBlock();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ contactBlocks: [block] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listContactBlocks(request())).toEqual([block]);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toEqual({ includeArchived: true });
  });
});

describe("createContactBlock / updateContactBlock / setContactBlockArchived", () => {
  it("posts the create mutation", async () => {
    const created = makeContactBlock();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ createContactBlock: created }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await createContactBlock(request(), { label: "Help desk" })).toEqual(created);
  });

  it("posts the update mutation", async () => {
    const updated = makeContactBlock({ department: "Support" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ updateContactBlock: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(
      await updateContactBlock(request(), "cb-1", { department: "Support", label: "Help desk" }),
    ).toEqual(updated);
  });

  it("posts the archive mutation", async () => {
    const archived = makeContactBlock({ archived: true });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ setContactBlockArchived: archived }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await setContactBlockArchived(request(), "cb-1", true)).toEqual(archived);
  });
});

describe("listReferences / createReference / updateReference", () => {
  it("lists every reference, active and archived", async () => {
    const ref = makeReference();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ references: [ref] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listReferences(request())).toEqual([ref]);
  });

  it("posts the create mutation", async () => {
    const created = makeReference();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ createReference: created }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(
      await createReference(request(), { kind: "LINK" as never, label: "Vendor portal" }),
    ).toEqual(created);
  });

  it("posts the update mutation", async () => {
    const updated = makeReference({ label: "Vendor portal v2" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ updateReference: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(
      await updateReference(request(), "ref-1", {
        kind: "LINK" as never,
        label: "Vendor portal v2",
      }),
    ).toEqual(updated);
  });
});

describe("setReferenceArchived / deleteReference", () => {
  it("posts the archive mutation", async () => {
    const archived = makeReference({ archived: true });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ setReferenceArchived: archived }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await setReferenceArchived(request(), "ref-1", true)).toEqual(archived);
  });

  it("posts the delete mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ deleteReference: true }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await deleteReference(request(), "ref-1")).toBe(true);
  });
});

describe("listDefinitions / createDefinition / updateDefinition", () => {
  it("lists every category's definitions, active and archived", async () => {
    const entry = makeDefinition();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ definitions: [entry] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listDefinitions(request())).toEqual([entry]);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toEqual({
      categoryId: null,
      includeArchived: true,
    });
  });

  it("posts the create mutation", async () => {
    const created = makeDefinition();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ createDefinition: created }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(
      await createDefinition(request(), {
        categoryId: "group-1",
        definition: "A planned, temporary gap in service.",
        term: "Maintenance window",
      }),
    ).toEqual(created);
  });

  it("posts the update mutation", async () => {
    const updated = makeDefinition({ definition: "A planned, communicated gap in service." });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ updateDefinition: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(
      await updateDefinition(request(), "def-1", {
        categoryId: "group-1",
        definition: "A planned, communicated gap in service.",
        term: "Maintenance window",
      }),
    ).toEqual(updated);
  });
});

describe("setDefinitionArchived / deleteDefinition", () => {
  it("posts the archive mutation", async () => {
    const archived = makeDefinition({ archived: true });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ setDefinitionArchived: archived }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await setDefinitionArchived(request(), "def-1", true)).toEqual(archived);
  });

  it("posts the delete mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ deleteDefinition: true }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await deleteDefinition(request(), "def-1")).toBe(true);
  });
});
