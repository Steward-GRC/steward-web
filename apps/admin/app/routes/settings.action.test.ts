// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { GatewayError } from "@steward-web/api-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({
  approveComplianceHardReset: vi.fn(),
  cancelComplianceHardReset: vi.fn(),
  executeComplianceHardReset: vi.fn(),
  requestComplianceHardReset: vi.fn(),
  saveWorkCalendar: vi.fn(),
  setComplianceModule: vi.fn(),
}));
const { saveWorkCalendar } = server;

vi.mock("../settings/settings.server", () => server);

import { action } from "./settings";

const CALENDAR = {
  holidays: [{ date: "2026-12-25", label: "" }],
  timezone: "UTC",
  weekdays: [1, 2, 3, 4, 5],
};

const post = (fields: Record<string, string>) =>
  action({
    context: {},
    params: {},
    request: new Request("https://admin.steward.example/settings", {
      body: new URLSearchParams(fields),
      method: "POST",
    }),
  } as unknown as Parameters<typeof action>[0]);

beforeEach(() => {
  for (const mock of Object.values(server)) mock.mockReset();
});

describe("the save-work-calendar action", () => {
  it("saves the posted calendar", async () => {
    saveWorkCalendar.mockResolvedValue({});
    const result = await post({
      intent: "save-work-calendar",
      workCalendar: JSON.stringify(CALENDAR),
    });
    expect(saveWorkCalendar).toHaveBeenCalledWith(expect.any(Request), CALENDAR);
    expect(result).toEqual({ intent: "save-work-calendar", ok: true });
  });

  it("returns the message of an INVALID_WORK_CALENDAR refusal", async () => {
    saveWorkCalendar.mockImplementation(() =>
      Promise.reject(
        new GatewayError("SetGlobalSettings", "unknown time zone Mars/Olympus_Mons", {
          code: "INVALID_WORK_CALENDAR",
          status: 400,
        }),
      ),
    );
    const result = (await post({
      intent: "save-work-calendar",
      workCalendar: JSON.stringify(CALENDAR),
    })) as unknown as { data: { calendarError: string; ok: boolean }; init: { status: number } };
    expect(result.data.ok).toBe(false);
    expect(result.data.calendarError).toBe("unknown time zone Mars/Olympus_Mons");
    expect(result.init.status).toBe(400);
  });

  it("rejects a body that is not a calendar without calling the gateway", async () => {
    const result = (await post({
      intent: "save-work-calendar",
      workCalendar: "{}",
    })) as unknown as { init: { status: number } };
    expect(saveWorkCalendar).not.toHaveBeenCalled();
    expect(result.init.status).toBe(400);
  });
});

const refused = (code: string) =>
  Promise.reject(
    new GatewayError("Operation", "server words that must not be shown", { code, status: 400 }),
  );

type Refusal = { data: { complianceError?: string; ok: boolean }; init: { status: number } };

describe("the compliance-module action", () => {
  it("switches the module off and on", async () => {
    server.setComplianceModule.mockResolvedValue({ moduleEnabled: false });
    expect(await post({ enabled: "false", intent: "compliance-module" })).toEqual({
      intent: "compliance-module",
      ok: true,
    });
    expect(server.setComplianceModule).toHaveBeenCalledWith(expect.any(Request), false);
    await post({ enabled: "true", intent: "compliance-module" });
    expect(server.setComplianceModule).toHaveBeenLastCalledWith(expect.any(Request), true);
  });

  it("hands back the code of a refusal and not its words", async () => {
    server.setComplianceModule.mockImplementation(() => refused("MODULE_OFF"));
    const result = (await post({
      enabled: "false",
      intent: "compliance-module",
    })) as unknown as Refusal;
    expect(result.data.ok).toBe(false);
    expect(result.data.complianceError).toBe("MODULE_OFF");
    expect(JSON.stringify(result)).not.toContain("must not be shown");
    expect(result.init.status).toBe(400);
  });
});

describe("the hard reset actions", () => {
  it("asks with a trimmed reason", async () => {
    server.requestComplianceHardReset.mockResolvedValue({});
    expect(await post({ intent: "hard-reset-request", reason: "  End of the pilot " })).toEqual({
      intent: "hard-reset-request",
      ok: true,
    });
    expect(server.requestComplianceHardReset).toHaveBeenCalledWith(
      expect.any(Request),
      "End of the pilot",
    );
  });

  it("refuses an empty reason without calling the gateway", async () => {
    const result = (await post({
      intent: "hard-reset-request",
      reason: " ".repeat(3),
    })) as unknown as Refusal;
    expect(server.requestComplianceHardReset).not.toHaveBeenCalled();
    expect(result.init.status).toBe(400);
  });

  it("approves and cancels by request id", async () => {
    server.approveComplianceHardReset.mockResolvedValue({});
    server.cancelComplianceHardReset.mockResolvedValue({});
    await post({ intent: "hard-reset-approve", requestId: "req-1" });
    await post({ intent: "hard-reset-cancel", requestId: "req-1" });
    expect(server.approveComplianceHardReset).toHaveBeenCalledWith(expect.any(Request), "req-1");
    expect(server.cancelComplianceHardReset).toHaveBeenCalledWith(expect.any(Request), "req-1");
  });

  it("runs the reset and answers the case count", async () => {
    server.executeComplianceHardReset.mockResolvedValue({
      approvedBy: "u-ada",
      casesDeleted: 42,
      requestedBy: "u-root",
    });
    const result = await post({
      confirmation: "RESET COMPLIANCE DATA",
      exportAcknowledged: "true",
      intent: "hard-reset-execute",
      requestId: "req-1",
    });
    expect(server.executeComplianceHardReset).toHaveBeenCalledWith(
      expect.any(Request),
      "req-1",
      "RESET COMPLIANCE DATA",
    );
    expect(result).toEqual({
      intent: "hard-reset-execute",
      ok: true,
      result: { approvedBy: "u-ada", casesDeleted: 42, requestedBy: "u-root" },
    });
  });

  it("does not run without the export acknowledgement", async () => {
    const result = (await post({
      confirmation: "RESET COMPLIANCE DATA",
      intent: "hard-reset-execute",
      requestId: "req-1",
    })) as unknown as Refusal;
    expect(server.executeComplianceHardReset).not.toHaveBeenCalled();
    expect(result.init.status).toBe(400);
  });

  it("does not run with a phrase that is not exact", async () => {
    const result = (await post({
      confirmation: "reset compliance data",
      exportAcknowledged: "true",
      intent: "hard-reset-execute",
      requestId: "req-1",
    })) as unknown as Refusal;
    expect(server.executeComplianceHardReset).not.toHaveBeenCalled();
    expect(result.data.complianceError).toBe("HARD_RESET_CONFIRMATION");
  });

  it.each([
    "HARD_RESET_CONFIRMATION",
    "HARD_RESET_MODULE_ON",
    "HARD_RESET_LEGAL_HOLD",
    "HARD_RESET_NOT_APPROVED",
    "HARD_RESET_ROOT_REQUIRED",
  ])("hands back %s from the gateway", async (code) => {
    server.executeComplianceHardReset.mockImplementation(() => refused(code));
    const result = (await post({
      confirmation: "RESET COMPLIANCE DATA",
      exportAcknowledged: "true",
      intent: "hard-reset-execute",
      requestId: "req-1",
    })) as unknown as Refusal;
    expect(result.data.complianceError).toBe(code);
    expect(result.init.status).toBe(400);
  });

  it("keeps an unknown refusal as a failure without a code", async () => {
    server.approveComplianceHardReset.mockImplementation(() => refused("SOMETHING_ELSE"));
    const result = (await post({
      intent: "hard-reset-approve",
      requestId: "req-1",
    })) as unknown as { data: { failure: { code: string } } } & Refusal;
    expect(result.data.complianceError).toBeUndefined();
    expect(result.data.failure.code).toBe("SOMETHING_ELSE");
  });
});
