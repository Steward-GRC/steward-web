// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { GatewayError } from "@steward-web/api-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const saveWorkCalendar = vi.hoisted(() => vi.fn());

vi.mock("../settings/settings.server", () => ({ saveWorkCalendar }));

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
  saveWorkCalendar.mockReset();
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
