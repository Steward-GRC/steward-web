// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { action as extract } from "./resources.documents.extract";
import { action as validateUrl } from "./resources.documents.validate-url";

const author = {
  email: "bob@example.org",
  firstName: "Bob",
  lastName: "Author",
  managedGroupIds: [],
  name: "Bob Author",
  permissions: ["policy.read", "policy.author"],
  roles: ["author"],
  scopes: { author: ["Workplace"] },
  userId: "u-1",
  username: "bob",
};

/** The gateway: `me` over GraphQL, and the two REST endpoints answering as `rest` says. */
const stubGateway = (rest: (path: string, init: RequestInit) => Response) => {
  const calls: { body: unknown; path: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init: RequestInit = {}) => {
      const path = new URL(url).pathname;
      if (path.endsWith("/query")) {
        return Promise.resolve(Response.json({ data: { me: author } }));
      }
      if (path.startsWith("/documents/")) {
        calls.push({ body: init.body, path });
        return Promise.resolve(rest(path, init));
      }
      return Promise.resolve(Response.json({}));
    }),
  );
  return calls;
};

const post = (path: string, body: FormData) =>
  ({
    params: {},
    request: new Request(`https://staff.steward.example${path}`, {
      body,
      headers: { cookie: "steward_sid=sid-1" },
      method: "POST",
    }),
  }) as never;

afterEach(() => vi.unstubAllGlobals());

describe("reading a reference document (U30)", () => {
  it("answers the document's text and how much of it was read", async () => {
    const calls = stubGateway(() =>
      Response.json({ content: "Visitors sign in at reception.", title: "notes.pdf" }),
    );
    const form = new FormData();
    form.set("file", new File(["%PDF"], "notes.pdf", { type: "application/pdf" }));

    const result = (await extract(post("/resources/documents/extract", form))) as {
      data: unknown;
    };

    expect(result.data).toEqual({
      characters: 30,
      content: "Visitors sign in at reception.",
      ok: true,
      title: "notes.pdf",
    });
    expect(calls[0]?.path).toBe("/documents/extract");
  });

  it("says it couldn't read the document when the gateway refuses it", async () => {
    stubGateway(() => Response.json({ error: "Unsupported file type: .exe" }, { status: 400 }));
    const form = new FormData();
    form.set("file", new File(["x"], "tool.exe"));

    const result = (await extract(post("/resources/documents/extract", form))) as {
      data: unknown;
    };

    expect(result.data).toEqual({ ok: false, reason: "Unsupported file type: .exe" });
  });

  it("refuses a post with no file without calling the gateway", async () => {
    const calls = stubGateway(() => Response.json({}));
    const result = (await extract(post("/resources/documents/extract", new FormData()))) as {
      data: unknown;
    };
    expect(result.data).toEqual({ ok: false, reason: null });
    expect(calls).toHaveLength(0);
  });
});

describe("checking a reference URL (U30)", () => {
  it("answers whether the gateway could read it", async () => {
    stubGateway(() => Response.json({ readable: false, reason: "not reachable" }));
    const form = new FormData();
    form.set("url", "https://policies.example.org/old");

    const result = (await validateUrl(post("/resources/documents/validate-url", form))) as {
      data: unknown;
    };

    expect(result.data).toEqual({
      ok: true,
      readable: false,
      url: "https://policies.example.org/old",
    });
  });

  it("refuses something that isn't a web address without asking the gateway", async () => {
    const calls = stubGateway(() => Response.json({ readable: true }));
    const form = new FormData();
    form.set("url", "policies old");

    const result = (await validateUrl(post("/resources/documents/validate-url", form))) as {
      data: unknown;
    };

    expect(result.data).toEqual({ malformed: true, ok: false, url: "policies old" });
    expect(calls).toHaveLength(0);
  });
});
