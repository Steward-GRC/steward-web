// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { aiOffReason, aiRefusalKey } from "./aiOff";

describe("the text for a refused AI start (bug log 260)", () => {
  it("says AI is unavailable when the service did not answer", () => {
    expect(aiRefusalKey({ code: "INTERNAL" })).toBe("refusedUnavailable");
    expect(aiRefusalKey({ status: 502 })).toBe("refusedUnavailable");
  });

  it("keeps the generic line for anything else", () => {
    expect(aiRefusalKey({ code: "PERMISSION_DENIED", status: 403 })).toBe("refused");
    expect(aiRefusalKey()).toBe("refused");
  });
});

describe("the text for why AI is off", () => {
  it("says what is wrong with the provider when the gateway names it", () => {
    expect(aiOffReason("provider_auth_failed")).toBe("editor.aiMenu.providerAuthFailed");
    expect(aiOffReason("provider_provider_error")).toBe("editor.aiMenu.providerError");
    expect(aiOffReason("provider_not_configured")).toBe("editor.aiMenu.providerNotConfigured");
  });

  it("keeps the existing lines for the other reasons", () => {
    expect(aiOffReason("disabled_by_admin")).toBe("editor.aiMenu.offByAdmin");
    expect(aiOffReason("limit_reached")).toBe("editor.aiMenu.limitReached");
    expect(aiOffReason("provider_unavailable")).toBe("editor.aiMenu.unavailable");
    expect(aiOffReason(null)).toBe("editor.aiMenu.unavailable");
  });
});
