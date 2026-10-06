// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Template, TemplateVersion } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createTemplate,
  createTemplateVersion,
  deleteTemplate,
  discardTemplateVersion,
  findTemplateByCode,
  listTemplates,
  listTemplateVersions,
  publishTemplateVersion,
  renameTemplate,
  retireTemplate,
  updateTemplateVersionSections,
} from "./templates.server";

const siteAdminMe = {
  email: "admin@example.com",
  name: "Admin",
  permissions: ["group.manage"],
  roles: ["site-admin"],
  userId: "u-admin",
  username: "admin",
};

const readerMe = {
  email: "reader@example.com",
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  userId: "u-reader",
  username: "reader",
};

const jsonOnce = (data: unknown) => Response.json({ data });

const makeTemplate = (overrides: Partial<Template> & Pick<Template, "id" | "name">): Template => ({
  code: "TPL-001",
  ownerCategoryId: null,
  retiredAt: null,
  ...overrides,
});

const makeVersion = (
  overrides: Partial<TemplateVersion> & Pick<TemplateVersion, "id" | "templateId">,
): TemplateVersion => ({
  sections: [],
  status: "draft",
  versionNo: 1,
  ...overrides,
});

const request = () => new Request("https://admin.steward.example/templates");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listTemplates", () => {
  it("redirects a caller who lacks group.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await listTemplates(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("answers the gateway's template list", async () => {
    const templates = [makeTemplate({ id: "t-1", name: "Standard" })];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ templates }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listTemplates(request())).toEqual(templates);
  });
});

describe("findTemplateByCode", () => {
  it("resolves the human-readable code to its template", async () => {
    const templates = [
      makeTemplate({ code: "TPL-001", id: "t-1", name: "Standard" }),
      makeTemplate({ code: "TPL-002", id: "t-2", name: "Runbook" }),
    ];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ templates }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await findTemplateByCode(request(), "TPL-002")).toEqual(templates[1]);
  });
});

describe("listTemplateVersions", () => {
  it("sorts the gateway's answer newest-first", async () => {
    const versions = [
      makeVersion({ id: "v-1", templateId: "t-1", versionNo: 1 }),
      makeVersion({ id: "v-2", templateId: "t-1", versionNo: 2 }),
    ];
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ templateVersions: versions }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await listTemplateVersions(request(), "t-1");
    expect(result.map((v) => v.id)).toEqual(["v-2", "v-1"]);
  });
});

describe("createTemplate", () => {
  it("posts the create mutation", async () => {
    const created = makeTemplate({ id: "t-new", name: "New" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ createTemplate: created }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await createTemplate(request(), "New", null);
    expect(result).toEqual(created);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ name: "New" });
  });
});

describe("renameTemplate", () => {
  it("posts the rename mutation", async () => {
    const renamed = makeTemplate({ id: "t-1", name: "Renamed" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ renameTemplate: renamed }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await renameTemplate(request(), "t-1", "Renamed")).toEqual(renamed);
  });
});

describe("retireTemplate", () => {
  it("posts the retire mutation", async () => {
    const retired = makeTemplate({
      id: "t-1",
      name: "Standard",
      retiredAt: "2026-01-01T00:00:00Z",
    });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ retireTemplate: retired }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await retireTemplate(request(), "t-1")).toEqual(retired);
  });
});

describe("deleteTemplate", () => {
  it("posts the delete mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ deleteTemplate: true }));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(deleteTemplate(request(), "t-1")).resolves.toBeUndefined();
  });
});

describe("createTemplateVersion", () => {
  it("posts the create-version mutation", async () => {
    const created = makeVersion({ id: "v-1", templateId: "t-1", versionNo: 1 });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ createTemplateVersion: created }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await createTemplateVersion(request(), "t-1", [])).toEqual(created);
  });
});

describe("updateTemplateVersionSections", () => {
  it("posts the save mutation", async () => {
    const sections = [
      { blocks: [], key: "scope", level: 1, order: 0, required: true, title: "Scope" },
    ];
    const updated = makeVersion({ id: "v-1", sections, templateId: "t-1" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ updateTemplateVersionSections: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await updateTemplateVersionSections(request(), "v-1", sections)).toEqual(updated);
  });
});

describe("publishTemplateVersion", () => {
  it("posts the publish mutation", async () => {
    const published = makeVersion({ id: "v-1", status: "published", templateId: "t-1" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ publishTemplateVersion: published }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await publishTemplateVersion(request(), "v-1")).toEqual(published);
  });
});

describe("discardTemplateVersion", () => {
  it("posts the discard mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ discardTemplateVersion: true }));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(discardTemplateVersion(request(), "v-1")).resolves.toBeUndefined();
  });
});
