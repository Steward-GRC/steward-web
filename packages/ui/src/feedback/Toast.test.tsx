// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import { notify } from "./Toast";

afterEach(() => {
  vi.restoreAllMocks();
});

const durationOf = (call: () => void): number | undefined => {
  const custom = vi.spyOn(toast, "custom").mockReturnValue("id");
  call();
  return (custom.mock.calls[0]?.[1] as { duration?: number } | undefined)?.duration;
};

describe("how long a toast stays (bug log 238)", () => {
  it("keeps a warning until it is closed, so Copy diagnostics can be reached", () => {
    expect(durationOf(() => notify.warning("Careful"))).toBe(Number.POSITIVE_INFINITY);
  });

  it("closes a warning by itself when the caller gives it a time", () => {
    expect(durationOf(() => notify.warning("Careful", { duration: 6000 }))).toBe(6000);
  });

  it("closes a success after five seconds", () => {
    expect(durationOf(() => notify.success("Done"))).toBe(5000);
  });
});
