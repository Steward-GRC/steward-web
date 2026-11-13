// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The runtime layer under the install setting: with reporting allowed, a site admin can still
// switch the Compliance module off. The gateway then refuses every report call with MODULE_OFF,
// and the case screens show a plain notice instead of Not found or a generic failure.
import { GatewayError } from "@steward-web/api-client";
import { render, screen } from "@testing-library/react";
import { type ComponentProps } from "react";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const gateway = vi.hoisted(() => ({
  getReportCase: vi.fn(),
  listReportCases: vi.fn(),
  postCaseMessage: vi.fn(),
}));

vi.mock("./reporting.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./reporting.server")>()),
  getReportCase: gateway.getReportCase,
  listReportCases: gateway.listReportCases,
  postCaseMessage: gateway.postCaseMessage,
}));

vi.mock("@steward-web/auth/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@steward-web/auth/server")>()),
  requireIdentityFromRequest: vi.fn(async () => ({ name: "Erin Reader", username: "erin" })),
}));

const { loader: queueLoader } = await import("../routes/reporting.cases");
const { default: Queue } = await import("../routes/reporting.cases");
const {
  action: caseAction,
  default: CaseDetail,
  loader: caseLoader,
} = await import("../routes/reporting.cases.$caseId");
const { isModuleOff } = await import("./moduleOff");

const request = (path: string) => new Request(`https://staff.example.org${path}`);

const refusal = (code: string) =>
  new GatewayError("ReportCases", "words the page must not show", { code, status: 400 });

beforeEach(() => {
  vi.stubEnv("STEWARD_REPORTING", "true");
  gateway.getReportCase.mockReset();
  gateway.listReportCases.mockReset();
  gateway.postCaseMessage.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isModuleOff", () => {
  it("is true only for a MODULE_OFF refusal", () => {
    expect(isModuleOff(refusal("MODULE_OFF"))).toBe(true);
    expect(isModuleOff(refusal("PERMISSION_DENIED"))).toBe(false);
    expect(isModuleOff(new Error("MODULE_OFF"))).toBe(false);
    expect(isModuleOff(null)).toBe(false);
  });
});

const runQueue = () =>
  queueLoader({ context: {}, params: {}, request: request("/reporting/cases") } as never);

const runCase = () =>
  caseLoader({
    context: {},
    params: { caseId: "case-1" },
    request: request("/reporting/cases/case-1"),
  } as never);

const show = (Component: () => React.JSX.Element) => {
  const Stub = createRoutesStub([{ Component, path: "/" }]);
  render(<Stub />);
};

describe("the case queue loader", () => {
  it("answers an empty queue marked off when the module is off", async () => {
    gateway.listReportCases.mockRejectedValue(refusal("MODULE_OFF"));
    expect(await runQueue()).toMatchObject({ moduleOff: true, queue: { cases: [], counts: [] } });
  });

  it("still fails for any other refusal", async () => {
    gateway.listReportCases.mockRejectedValue(refusal("PERMISSION_DENIED"));
    await expect(runQueue()).rejects.toBeInstanceOf(GatewayError);
  });

  it("is not off when the queue answers", async () => {
    gateway.listReportCases.mockResolvedValue({ cases: [], counts: [] });
    expect(await runQueue()).toMatchObject({ moduleOff: false });
  });
});

describe("the case loader", () => {
  it("answers off when the module is off, not Not found", async () => {
    gateway.getReportCase.mockRejectedValue(refusal("MODULE_OFF"));
    expect(await runCase()).toEqual({ moduleOff: true, reportCase: null });
  });

  it("is still Not found for any other failure", async () => {
    gateway.getReportCase.mockRejectedValue(refusal("NOT_FOUND"));
    const thrown: unknown = await runCase().catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });
});

const queueProps = {
  loaderData: { filter: "open", moduleOff: true, queue: { cases: [], counts: [] } },
} as unknown as ComponentProps<typeof Queue>;
const caseProps = {
  loaderData: { moduleOff: true, reportCase: null },
} as unknown as ComponentProps<typeof CaseDetail>;

const post = (intent: string) => {
  const form = new FormData();
  form.set("intent", intent);
  form.set("body", "hello");
  return caseAction({
    context: {},
    params: { caseId: "case-1" },
    request: new Request("https://staff.example.org/reporting/cases/case-1", {
      body: form,
      method: "POST",
    }),
  } as never);
};

describe("the case action", () => {
  it("sends the page back to itself when the module went off mid-session", async () => {
    gateway.postCaseMessage.mockRejectedValue(refusal("MODULE_OFF"));
    const thrown: unknown = await post("post-message").catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(302);
    expect((thrown as Response).headers.get("location")).toBe("/reporting/cases/case-1");
  });

  it("answers any other refusal as before", async () => {
    gateway.postCaseMessage.mockRejectedValue(refusal("PERMISSION_DENIED"));
    const answer = (await post("post-message")) as unknown as { init: { status: number } };
    expect(answer.init.status).toBe(400);
  });
});

describe("the notice", () => {
  it("replaces the queue", async () => {
    show(() => <Queue {...queueProps} />);
    expect(await screen.findByText("Reporting is turned off")).toBeVisible();
    expect(screen.getByText(/A site admin can turn it on in Settings/)).toBeVisible();
    expect(screen.queryByText("No cases")).not.toBeInTheDocument();
    expect(screen.queryByText("words the page must not show")).not.toBeInTheDocument();
  });

  it("replaces the case page", async () => {
    show(() => <CaseDetail {...caseProps} />);
    expect(await screen.findByText("Reporting is turned off")).toBeVisible();
  });
});
