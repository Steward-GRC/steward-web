// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AckExport, AckRoster, CompletionReport } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ackExportDownload,
  exportAcks,
  getAckRoster,
  getCompletionReport,
} from "./completion.server";

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

const exportRequest = (query: string) =>
  new Request(`https://admin.steward.example/admin/resources/acks-export?${query}`);

describe("ackExportDownload", () => {
  it("answers the export as a CSV file download named after the policy", async () => {
    const result: AckExport = { contentType: "text/csv", data: "dXNlcixlbWFpbAo=" };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonOnce({ me: readerMe }))
        .mockResolvedValueOnce(jsonOnce({ exportAcks: result })),
    );

    const response = await ackExportDownload(
      exportRequest("policyVersionId=pv-1&number=POL-HR-002"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="acks-POL-HR-002.csv"',
    );
    expect(await response.text()).toBe("user,email\n");
  });

  it("refuses a request with no policy version", async () => {
    const thrown: unknown = await ackExportDownload(exportRequest("number=POL-HR-002")).catch(
      (error: unknown) => error,
    );
    expect(thrown).toMatchObject({ init: { status: 400 } });
  });

  it("refuses a policy number that would break the file name header", async () => {
    const thrown: unknown = await ackExportDownload(
      exportRequest(`policyVersionId=pv-1&number=${encodeURIComponent('x"\r\nSet-Cookie: a=b')}`),
    ).catch((error: unknown) => error);
    expect(thrown).toMatchObject({ init: { status: 400 } });
  });
});
