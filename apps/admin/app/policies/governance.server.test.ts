// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { runGovernance } from "./governance.server";

const document = {
  currentVersionId: "v-3",
  id: "p-desk",
  sensitive: false,
};

type Answer = { errors: unknown[] } | Record<string, unknown>;

/** A gateway answering each operation by name, recording what it was asked. */
const stubGateway = (answers: Record<string, Answer>) => {
  const calls: { operation: string; variables: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const { query, variables } = JSON.parse(init.body as string) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /(?:query|mutation) (\w+)/.exec(query)?.[1] ?? "";
      calls.push({ operation, variables });
      const answer = answers[operation];
      if (!answer) return Response.json({ errors: [{ message: `unexpected ${operation}` }] });
      return Response.json("errors" in answer ? answer : { data: answer });
    }),
  );
  return calls;
};

const form = (fields: Record<string, string>) => {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return body;
};

const request = new Request("https://steward.example/admin/policies/POL-1", {
  headers: { cookie: "steward_sid=sid-1" },
});

const run = (fields: Record<string, string>, sensitive = false) =>
  runGovernance({
    document: { ...document, sensitive },
    form: form(fields),
    request,
    staffUrl: "https://steward.example/",
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("runGovernance (A11)", () => {
  it("makes the chosen person the author (D5)", async () => {
    const calls = stubGateway({ SetPolicyOwner: { setPolicyOwner: { id: "p-desk" } } });
    expect(await run({ intent: "changeAuthor", ownerUserId: "u-carol" })).toEqual({
      intent: "changeAuthor",
      ok: true,
    });
    expect(calls[0]).toEqual({
      operation: "SetPolicyOwner",
      variables: { ownerUserId: "u-carol", policyId: "p-desk" },
    });
  });

  it("moves the policy and answers its new number (D6)", async () => {
    const calls = stubGateway({
      MovePolicy: { movePolicy: { id: "p-desk", number: "POL-TRAVEL-000002" } },
    });
    expect(await run({ homeCategoryId: "c-travel", intent: "move" })).toEqual({
      intent: "move",
      number: "POL-TRAVEL-000002",
      ok: true,
    });
    expect(calls[0]?.variables).toEqual({ homeCategoryId: "c-travel", policyId: "p-desk" });
  });

  it("retires the policy (D10) and deletes one (D4)", async () => {
    const calls = stubGateway({
      DeletePolicy: { deletePolicy: true },
      RetirePolicy: { retirePolicy: { id: "p-desk" } },
    });
    expect(await run({ intent: "retire" })).toEqual({ intent: "retire", ok: true });
    expect(await run({ intent: "delete" })).toEqual({ intent: "delete", ok: true });
    expect(calls.map((call) => [call.operation, call.variables])).toEqual([
      ["RetirePolicy", { id: "p-desk" }],
      ["DeletePolicy", { id: "p-desk" }],
    ]);
  });

  it("answers the gateway's refusal, not a throw", async () => {
    stubGateway({
      DeletePolicy: {
        errors: [{ extensions: { code: "FAILED_PRECONDITION" }, message: "published" }],
      },
    });
    const answer = await run({ intent: "delete" });
    expect(answer).toMatchObject({ intent: "delete", ok: false });
  });

  it("starts the current version's PDF, then answers pending until the link is ready (D16)", async () => {
    const calls = stubGateway({
      RequestPdfExport: { requestPDFExport: { jobId: "job-7" } },
    });
    expect(await run({ intent: "exportPdf" })).toEqual({
      intent: "exportPdf",
      jobId: "job-7",
      ok: true,
    });
    expect(calls[0]?.variables).toEqual({ policyVersionId: "v-3" });

    stubGateway({
      PdfDownloadLink: {
        errors: [{ extensions: { code: "PDF_EXPORT_NOT_READY" }, message: "not ready" }],
      },
    });
    expect(await run({ intent: "pdfLink", jobId: "job-7" })).toEqual({
      intent: "pdfLink",
      ok: true,
      pending: true,
    });

    stubGateway({
      PdfDownloadLink: {
        pdfDownloadLink: { expiresAt: "2026-11-05T12:00:00Z", signedUrl: "https://files/x.pdf" },
      },
    });
    expect(await run({ intent: "pdfLink", jobId: "job-7" })).toEqual({
      intent: "pdfLink",
      ok: true,
      pending: false,
      signedUrl: "https://files/x.pdf",
    });
  });

  it("issues a magic link to the staff app's shared reader (G16), sensitive when the policy is (D31)", async () => {
    const calls = stubGateway({
      CreateMagicLink: {
        createMagicLink: { expiresAt: "2026-12-05T12:00:00Z", token: "7c1e04b2" },
      },
    });
    expect(await run({ intent: "createMagicLink" }, true)).toEqual({
      expiresAt: "2026-12-05T12:00:00Z",
      intent: "createMagicLink",
      ok: true,
      token: "7c1e04b2",
      url: "https://steward.example/share/7c1e04b2",
    });
    // The policy's own sensitivity, never a value from the form.
    expect(calls[0]?.variables).toEqual({ policyVersionId: "v-3", sensitive: true });
  });

  it("revokes a link, and re-issues one by revoking it then creating another", async () => {
    const calls = stubGateway({
      CreateMagicLink: {
        createMagicLink: { expiresAt: "2026-12-05T12:00:00Z", token: "9f20aa31" },
      },
      RevokeMagicLink: { revokeMagicLink: true },
    });
    expect(await run({ intent: "revokeMagicLink", token: "7c1e04b2" })).toEqual({
      intent: "revokeMagicLink",
      ok: true,
      token: "7c1e04b2",
    });
    expect(await run({ intent: "reissueMagicLink", token: "7c1e04b2" })).toMatchObject({
      intent: "reissueMagicLink",
      ok: true,
      replaced: "7c1e04b2",
      token: "9f20aa31",
    });
    expect(calls.map((call) => call.operation)).toEqual([
      "RevokeMagicLink",
      "RevokeMagicLink",
      "CreateMagicLink",
    ]);
  });

  it("refuses an export or a link before the first publish", async () => {
    stubGateway({});
    const draft = await runGovernance({
      document: { ...document, currentVersionId: null },
      form: form({ intent: "createMagicLink" }),
      request,
      staffUrl: "/",
    });
    expect(draft).toMatchObject({ intent: "createMagicLink", ok: false });
  });

  it("rejects an intent it doesn't know", async () => {
    await expect(run({ intent: "rename" })).rejects.toMatchObject({ status: 400 });
  });
});
