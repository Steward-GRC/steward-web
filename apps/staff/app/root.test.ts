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

describe("staff root loader", () => {
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
      request: new Request("https://staff.steward.example/sign-in"),
    } as unknown as LoaderArguments);

    expect(result.siteSettings).toEqual(settings);
    expect(result.identity.id).toBe("");
  });

  it("still renders the page when the banners can't be read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await loader({
      request: new Request("https://staff.steward.example/"),
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

const load = () =>
  loader({
    request: new Request("https://staff.steward.example/", {
      headers: { cookie: "steward_sid=abc" },
    }),
  } as unknown as LoaderArguments);

const gateway = (permissions: string[], calls: string[] = []) =>
  vi.fn((_url: string, init: RequestInit) => {
    const body = String(init.body);
    if (body.includes("globalSettings")) return answer({ globalSettings: settings });
    if (body.includes("query Me")) return answer({ me: me(permissions) });
    if (body.includes("query CategoryTree")) {
      calls.push("categories");
      return answer({
        categoryTree: [category("c1", "Workplace", null), category("c2", "Facilities", "c1")],
      });
    }
    if (body.includes("query PendingTasks")) {
      calls.push("approvals");
      const task = { dueAt: null, policyTitle: "Desk Booking Policy", stageIndex: 0 };
      return answer({
        pendingTasks: [
          { ...task, policyVersionId: "v1", runId: "r1", taskId: "t1" },
          { ...task, policyVersionId: "v2", runId: "r2", taskId: "t2" },
        ],
      });
    }
    return Promise.reject(new Error(`unexpected request: ${body.slice(0, 40)}`));
  });

describe("the staff shell's To acknowledge count", () => {
  it("counts what the person still has to acknowledge", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        const body = String(init.body);
        if (body.includes("globalSettings")) return answer({ globalSettings: settings });
        if (body.includes("query Me")) return answer({ me: me(["policy.read"]) });
        if (body.includes("query CategoryTree")) return answer({ categoryTree: [] });
        if (body.includes("query MyObligations"))
          return answer({
            myObligations: [
              { number: "N-1", policyId: "p-1", policyVersionId: "v-1", title: "T", version: "1" },
            ],
          });
        return Promise.reject(new Error(`unexpected request: ${body.slice(0, 40)}`));
      }),
    );
    const result = await load();
    expect(result.shell.counts).toEqual({ acknowledge: 1 });
  });
});

describe("the staff shell's data", () => {
  it("counts pending approvals and lists the categories for Browse by category", async () => {
    vi.stubGlobal("fetch", gateway(["policy.read", "policy.approve"]));
    const result = await load();
    expect(result.shell.counts).toEqual({ approvals: 2 });
    expect(result.shell.categories).toEqual([
      { id: "c1", name: "Workplace", slug: "workplace", subcategories: ["Facilities"] },
    ]);
  });

  it("asks for nothing the person can't use", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", gateway([], calls));
    const result = await load();
    expect(calls).toEqual([]);
    expect(result.shell.counts).toEqual({});
    expect(result.shell.categories).toEqual([]);
  });

  it("reads the install settings and the reporting switch", async () => {
    vi.stubEnv("STEWARD_ENVIRONMENT", "test");
    vi.stubEnv("STEWARD_ORGANISATION", "Example Organisation");
    vi.stubEnv("STEWARD_REPORTING", "true");
    vi.stubGlobal("fetch", gateway(["policy.read"]));
    const result = await load();
    expect(result.shell.config).toMatchObject({
      environment: "test",
      organisation: "Example Organisation",
    });
    expect(result.shell.reporting).toBe(true);
    vi.unstubAllEnvs();
  });
});

/** The root loader for someone signed in who still owes first-run onboarding. */
const owing = (path: string) => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init: RequestInit) => {
      const body = String(init.body);
      if (body.includes("globalSettings")) return answer({ globalSettings: settings });
      if (body.includes("query Me"))
        return answer({ me: { ...me(["policy.read"]), needsOnboarding: true } });
      return answer({ categoryTree: [], pendingTasks: [] });
    }),
  );
  return loader({
    request: new Request(`https://staff.steward.example${path}`, {
      headers: { cookie: "steward_sid=abc" },
    }),
  } as unknown as LoaderArguments);
};

describe("first-run onboarding", () => {
  it("sends someone who still owes it to the welcome page first", async () => {
    const thrown = await owing("/policies?q=desk").catch((error: unknown) => error);
    expect((thrown as Response).headers.get("location")).toBe(
      "/welcome?next=%2Fpolicies%3Fq%3Ddesk",
    );
  });

  it("lets them reach the welcome page and sign out", async () => {
    await expect(owing("/welcome")).resolves.toMatchObject({ identity: { id: "user-alice" } });
    await expect(owing("/sign-out")).resolves.toMatchObject({ identity: { id: "user-alice" } });
  });
});
