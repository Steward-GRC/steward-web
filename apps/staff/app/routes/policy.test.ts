// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The reader's answer for a policy or procedure the caller can't open: the gateway refuses
// one they may not see with NotFound, and that has to read exactly like a missing number.
import { afterEach, describe, expect, it, vi } from "vitest";

import * as policy from "./policy";
import * as procedure from "./procedure";

const me = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  managedGroupIds: [],
  name: "Ada Lovelace",
  permissions: ["policy.read"],
  roles: ["reader"],
  userId: "u-ada",
  username: "alovelace",
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
  if (!(thrown instanceof Response)) throw thrown;
  return { body: await thrown.text(), status: thrown.status };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.each([
  ["policy", policy.loader, "/policies/SEC-009"],
  ["procedure", procedure.loader, "/procedures/SEC-009"],
])("the staff %s reader", (_name, loader, path) => {
  it("answers 404 when the gateway refuses with NotFound", async () => {
    stubGateway(refused);
    expect(await answer(loader, path)).toEqual({ body: "Not Found", status: 404 });
  });

  it("answers a refused number exactly as a missing one", async () => {
    stubGateway(refused);
    const hidden = await answer(loader, path);
    stubGateway(missing);
    expect(await answer(loader, path)).toEqual(hidden);
  });
});
