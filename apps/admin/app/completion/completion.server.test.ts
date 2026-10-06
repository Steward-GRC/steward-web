// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AckExport, AckRoster, CompletionReport } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import { exportAcks, getAckRoster, getCompletionReport } from "./completion.server";

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

const request = () => new Request("https://admin.steward.example/completion");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCompletionReport", () => {
  it("redirects a signed-out caller", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: null })));
    const thrown: unknown = await getCompletionReport(request(), "pv-1").catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
  });

  it("forwards the policy version and optional group to the report query", async () => {
    const report: CompletionReport = {
      avgDaysToAck: 2.5,
      completionPct: 80,
      overdue: [],
      totalAcked: 4,
      totalAudience: 5,
      viewedNotAckedCount: 1,
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ completionReport: report }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await getCompletionReport(request(), "pv-1", "group-1")).toEqual(report);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toEqual({
      groupId: "group-1",
      policyVersionId: "pv-1",
    });
  });
});

describe("getAckRoster", () => {
  it("returns the acked/pending roster", async () => {
    const roster: AckRoster = {
      acked: [
        { ackedAt: "2026-09-01T00:00:00Z", email: "a@example.com", userId: "u-1", userName: "A" },
      ],
      pending: [],
    };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ ackRoster: roster }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await getAckRoster(request(), "pv-1")).toEqual(roster);
  });
});

describe("exportAcks", () => {
  it("requests a csv export of the roster", async () => {
    const result: AckExport = { contentType: "text/csv", data: "dGVzdA==" };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
      .mockResolvedValueOnce(jsonOnce({ exportAcks: result }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await exportAcks(request(), "pv-1")).toEqual(result);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toEqual({
      format: "csv",
      policyVersionId: "pv-1",
    });
  });
});
