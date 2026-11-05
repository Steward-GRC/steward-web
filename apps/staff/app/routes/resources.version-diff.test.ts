// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The compare pickers' data (U19): the diff between the two versions picked.
import { afterEach, describe, expect, it, vi } from "vitest";

import { loader } from "./resources.version-diff";

const me = {
  email: "erin@example.org",
  firstName: "Erin",
  lastName: "Reader",
  managedGroupIds: [],
  name: "Erin Reader",
  permissions: ["policy.read"],
  roles: ["reader"],
  userId: "u-erin",
  username: "erin",
};

const diff = [
  {
    changeType: "MODIFIED",
    sectionKey: "receipts",
    sectionTitle: "Receipts",
    wordDiffHtml: "<ins>photos</ins>",
  },
];

/** A gateway that knows the caller and answers DiffVersions with `answer`. */
const stubGateway = (answer: () => unknown) => {
  const asked: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const { query, variables } = JSON.parse(init.body as string) as {
        query: string;
        variables: unknown;
      };
      const operation = /^(?:query|mutation) (\w+)/m.exec(query)?.[1];
      if (operation === "Me") return Response.json({ data: { me } });
      if (operation === "DiffVersions") {
        asked.push(variables);
        return Response.json(answer());
      }
      return Response.json({ errors: [{ message: `unexpected ${operation}` }] });
    }),
  );
  return asked;
};

const load = (loader: (arguments_: never) => unknown, search: string) =>
  loader({
    params: {},
    request: new Request(`https://steward.example/resources/version-diff${search}`, {
      headers: { cookie: "steward_sid=sid-1" },
    }),
  } as never);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the version diff", () => {
  it("diffs the two versions picked", async () => {
    const asked = stubGateway(() => ({ data: { diffVersions: diff } }));
    expect(await load(loader, "?from=v-1&to=v-3")).toEqual({ diff });
    expect(asked).toEqual([{ fromVersionId: "v-1", toVersionId: "v-3" }]);
  });

  it("answers no diff without asking when a version is missing", async () => {
    const asked = stubGateway(() => ({ data: { diffVersions: diff } }));
    expect(await load(loader, "?from=v-1")).toEqual({ diff: [] });
    expect(asked).toEqual([]);
  });

  it("hands back a refusal rather than throwing, so the page stays up", async () => {
    stubGateway(() => ({ errors: [{ extensions: { code: "INTERNAL" }, message: "down" }] }));
    expect(await load(loader, "?from=v-1&to=v-3")).toMatchObject({
      diff: [],
      failure: expect.any(Object),
    });
  });
});
