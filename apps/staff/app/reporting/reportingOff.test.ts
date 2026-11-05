// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Compliance reporting is off for rc.1 (decision 5-screens.s14): the case routes answer not
// found and never reach the gateway unless the install turns reporting on with
// STEWARD_REPORTING=true.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const gateway = vi.hoisted(() => ({
  getReportCase: vi.fn(),
  listReportCases: vi.fn(),
}));

vi.mock("./reporting.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./reporting.server")>()),
  getReportCase: gateway.getReportCase,
  listReportCases: gateway.listReportCases,
}));

const { loader: queueLoader } = await import("../routes/reporting.cases");
const { action: caseAction, loader: caseLoader } =
  await import("../routes/reporting.cases.$caseId");

vi.mock("@steward-web/auth/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@steward-web/auth/server")>()),
  requireIdentityFromRequest: vi.fn(async () => ({ name: "Erin Reader", username: "erin" })),
}));

const statusOf = async (run: () => unknown) => {
  try {
    await run();
  } catch (error) {
    if (error instanceof Response) return error.status;
    throw error;
  }
  return 200;
};

const request = (path: string, init?: RequestInit) =>
  new Request(`https://staff.example.org${path}`, init);

beforeEach(() => {
  gateway.getReportCase.mockReset().mockResolvedValue({ id: "case-1" });
  gateway.listReportCases.mockReset().mockResolvedValue([]);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("with reporting off (the rc.1 default)", () => {
  it("answers not found for the case queue without asking the gateway", async () => {
    const routeArguments = { context: {}, params: {}, request: request("/reporting/cases") };
    expect(await statusOf(() => queueLoader(routeArguments as never))).toBe(404);
    expect(gateway.listReportCases).not.toHaveBeenCalled();
  });

  it("answers not found for a case and refuses its actions", async () => {
    const caseParameters = { caseId: "case-1" };
    const loaderArguments = {
      context: {},
      params: caseParameters,
      request: request("/reporting/cases/case-1"),
    };
    expect(await statusOf(() => caseLoader(loaderArguments as never))).toBe(404);

    const form = new FormData();
    form.set("intent", "post-message");
    const actionArguments = {
      context: {},
      params: caseParameters,
      request: request("/reporting/cases/case-1", { body: form, method: "POST" }),
    };
    expect(await statusOf(() => caseAction(actionArguments as never))).toBe(404);
    expect(gateway.getReportCase).not.toHaveBeenCalled();
  });

  it("treats anything but true as off", async () => {
    vi.stubEnv("STEWARD_REPORTING", "yes");
    const routeArguments = { context: {}, params: {}, request: request("/reporting/cases") };
    expect(await statusOf(() => queueLoader(routeArguments as never))).toBe(404);
  });
});

describe("with reporting on", () => {
  beforeEach(() => {
    vi.stubEnv("STEWARD_REPORTING", "true");
  });

  it("serves the case queue and a case as before", async () => {
    const queue = { context: {}, params: {}, request: request("/reporting/cases") };
    expect(await statusOf(() => queueLoader(queue as never))).toBe(200);
    expect(gateway.listReportCases).toHaveBeenCalledOnce();

    const one = {
      context: {},
      params: { caseId: "case-1" },
      request: request("/reporting/cases/case-1"),
    };
    expect(await statusOf(() => caseLoader(one as never))).toBe(200);
    expect(gateway.getReportCase).toHaveBeenCalledOnce();
  });
});
