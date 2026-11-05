// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The reader's answer for a policy or procedure the caller can't open: the gateway refuses
// one they may not see with NotFound, and that has to read exactly like a missing number.
import { afterEach, describe, expect, it, vi } from "vitest";

import * as policy from "./policy";
import * as procedure from "./procedure";

const me = {
  email: "bob@example.org",
  firstName: "Bob",
  lastName: "Author",
  managedGroupIds: [],
  name: "Bob Author",
  permissions: ["policy.read"],
  roles: ["reader"],
  userId: "u-bob",
  username: "bob",
};

/** A gateway that knows the caller and answers the number lookup with `byNumber`. */
const stubGateway = (byNumber: Record<string, unknown>) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const { query } = JSON.parse(init.body as string) as { query: string };
      const operation = /^(?:query|mutation) (\w+)/m.exec(query)?.[1];
      if (operation === "Me") return Response.json({ data: { me } });
      if (operation === "CategoryTree") return Response.json({ data: { categoryTree: [] } });
      if (operation === "PolicyByNumber") return Response.json(byNumber);
      return Response.json({ errors: [{ message: `unexpected ${operation}` }] });
    }),
  );

const refused = { errors: [{ extensions: { code: "NotFound" }, message: "policy not found" }] };
const missing = { data: { policyByNumber: null } };

// Each route's loader is typed with its own generated args; the test only passes the two
// fields they read.
const answer = async (loader: (arguments_: never) => unknown, path: string) => {
  const arguments_ = {
    params: { number: "SEC-009" },
    request: new Request(`https://steward.example${path}`, {
      headers: { cookie: "steward_sid=sid-1" },
    }),
  } as never;
  const thrown = await Promise.resolve()
    .then(() => loader(arguments_))
    .then(
      () => {
        throw new Error("expected the loader to refuse");
      },
      (error: unknown) => error,
    );
  // A missing document is thrown as `data({ kind, number }, { status: 404 })`, so the error
  // boundary can say which number matched nothing (6-states.s3).
  const refusal = thrown as { data?: unknown; init?: { status?: number }; type?: string };
  if (refusal.type !== "DataWithResponseInit") throw thrown;
  return { body: refusal.data, status: refusal.init?.status };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.each([
  ["policy", policy.loader, "/policies/SEC-009"],
  ["procedure", procedure.loader, "/procedures/SEC-009"],
])("the admin %s reader", (_name, loader, path) => {
  it("answers 404 when the gateway refuses with NotFound", async () => {
    stubGateway(refused);
    expect(await answer(loader, path)).toEqual({
      body: { kind: path.startsWith("/procedures") ? "procedure" : "policy", number: "SEC-009" },
      status: 404,
    });
  });

  it("answers a refused number exactly as a missing one", async () => {
    stubGateway(refused);
    const hidden = await answer(loader, path);
    stubGateway(missing);
    expect(await answer(loader, path)).toEqual(hidden);
  });
});
