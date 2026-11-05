// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveRow, UpdatedJustNow, useLiveUpdate } from "./LiveUpdate";

const Card = ({ value }: { value: string }) => {
  const live = useLiveUpdate(value);
  return (
    <div>
      <UpdatedJustNow at={live.updatedAt} />
      <LiveRow flash={live.flash}>{value}</LiveRow>
    </div>
  );
};

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

describe("the live-update cue (U1)", () => {
  it("doesn't flash on the first render", () => {
    render(<Card value="Tested" />);
    expect(screen.getByText("Tested")).not.toHaveClass("stw-updated");
    expect(screen.queryByText("Updated just now")).toBeNull();
  });

  it("flashes the changed row once in soft plum and says Updated just now", () => {
    const { rerender } = render(<Card value="Not tested" />);
    rerender(<Card value="Tested" />);
    const row = screen.getByText("Tested");
    expect(row).toHaveClass("stw-updated");
    expect(screen.getByRole("status")).toHaveTextContent("Updated just now");
    act(() => vi.advanceTimersByTime(1200));
    expect(row).not.toHaveClass("stw-updated");
  });

  it("drops Updated just now after a minute", () => {
    const { rerender } = render(<Card value="Not tested" />);
    rerender(<Card value="Tested" />);
    act(() => vi.advanceTimersByTime(61_000));
    expect(screen.queryByText("Updated just now")).toBeNull();
  });
});
