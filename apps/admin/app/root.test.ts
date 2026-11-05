// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { pageTitle } from "@steward-web/shell";
import { afterEach, describe, expect, it, vi } from "vitest";

import { links, loader } from "./root";
import routes from "./routes";
import { PAGE_TITLES } from "./titles";

const settings = {
  announcement: { enabled: true, level: "warning", message: "Acknowledge by Friday." },
  maintenance: { enabled: true, message: "Read-only tonight." },
};

type LoaderArguments = Parameters<typeof loader>[0];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin root loader", () => {
  it("loads the site banners alongside the identity, even signed out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        const body = String(init.body);
        if (body.includes("globalSettings")) {
          return Promise.resolve(Response.json({ data: { globalSettings: settings } }));
        }
        return Promise.resolve(
          Response.json({
            errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "signed out" }],
          }),
        );
      }),
    );

    const result = await loader({
      request: new Request("https://admin.steward.example/sign-in"),
    } as unknown as LoaderArguments);

    expect(result.siteSettings).toEqual(settings);
    expect(result.identity.id).toBe("");
  });

  it("still renders the page when the banners can't be read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await loader({
      request: new Request("https://admin.steward.example/"),
    } as unknown as LoaderArguments);

    expect(result.siteSettings).toBeNull();
  });
});

describe("the page head", () => {
  it("links the designed favicons, touch icon and web manifest", () => {
    const hrefs = links().map((link) => ("href" in link ? link.href : ""));
    for (const file of ["favicon.ico", "favicon.svg", "apple-touch-icon.png", "site.webmanifest"]) {
      expect(hrefs.some((href) => href?.endsWith(`/${file}`))).toBe(true);
    }
  });

  it("gives every page route a title, as '<page> · Steward'", () => {
    const pages = routes
      .map((entry) => entry.id ?? entry.file.replace(/\.tsx$/, ""))
      .filter((id) => !id.startsWith("routes/resources."));
    for (const id of pages) {
      expect(pageTitle(PAGE_TITLES, [{ id: "root" }, { id }]), id).toMatch(/^\S.* · Steward$/);
    }
  });
});

const me = (permissions: string[]) => ({
  email: "alice@example.org",
  firstName: "Alice",
  lastName: "Admin",
  managedGroupIds: [],
  name: "Alice Admin",
  permissions,
  roles: [],
  scopes: { author: [] },
  userId: "user-alice",
  username: "alice",
});

const category = (id: string, name: string, parentId: null | string) => ({
  ackEveryone: false,
  ackEveryoneSet: false,
  ackTriggers: [],
  defaultTemplateId: null,
  defaultTemplateNone: false,
  defaultWorkflowId: null,
  exclusionGroupIds: [],
  id,
  idpGroupIds: [],
  name,
  owners: [],
  parentId,
  reviewCadence: null,
  reviewDate: null,
  slug: name.toLowerCase(),
});

const answer = (data: unknown) => Promise.resolve(Response.json({ data }));

const gateway = (permissions: string[], calls: string[] = []) =>
  vi.fn((_url: string, init: RequestInit) => {
    const body = String(init.body);
    if (body.includes("globalSettings")) return answer({ globalSettings: settings });
    if (body.includes("query Me")) return answer({ me: me(permissions) });
    if (body.includes("query CategoryChildren")) {
      calls.push("categories");
      const { parentId } = (JSON.parse(body) as { variables: { parentId: null | string } })
        .variables;
      const children =
        parentId === null
          ? [category("c1", "Workplace", null)]
          : parentId === "c1"
            ? [category("c2", "Facilities", "c1")]
            : [];
      return answer({ categoryChildren: children });
    }
    return Promise.reject(new Error(`unexpected request: ${body.slice(0, 40)}`));
  });

const load = () =>
  loader({
    request: new Request("https://admin.steward.example/admin/", {
      headers: { cookie: "steward_sid=abc" },
    }),
  } as unknown as LoaderArguments);

describe("the admin shell's data", () => {
  it("loads the category tree for someone who manages categories", async () => {
    vi.stubGlobal("fetch", gateway(["group.manage"]));
    const result = await load();
    expect(result.shell.categories).toEqual([
      { id: "c1", name: "Workplace", parentId: null },
      { id: "c2", name: "Facilities", parentId: "c1" },
    ]);
  });

  it("asks for no categories from someone who can't manage them", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", gateway(["audit.read"], calls));
    const result = await load();
    expect(calls).toEqual([]);
    expect(result.shell.categories).toEqual([]);
  });

  it("reads the install settings and the reporting switch", async () => {
    vi.stubEnv("STEWARD_STAFF_URL", "https://steward.example/");
    vi.stubEnv("STEWARD_REPORTING", "true");
    vi.stubGlobal("fetch", gateway([]));
    const result = await load();
    expect(result.shell.config.staffUrl).toBe("https://steward.example/");
    expect(result.shell.reporting).toBe(true);
    vi.unstubAllEnvs();
  });
});
