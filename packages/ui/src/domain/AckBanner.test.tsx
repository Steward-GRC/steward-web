// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate } from "@steward-web/i18n";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AckBanner } from "./AckBanner";

describe("the acknowledgement banner (U8)", () => {
  it("asks in soft plum with the book icon and the action, with no Copy diagnostics", () => {
    render(<AckBanner action={<button type="button">Acknowledge</button>} state="pending" />);
    const banner = screen.getByTestId("ack-banner");
    expect(banner).toHaveAttribute("data-state", "pending");
    expect(banner).toHaveClass("bg-primary-soft");
    expect(screen.getByText("Please review and confirm")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please take a moment to read this policy, then confirm you've reviewed it.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acknowledge" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /diagnostics/i })).toBeNull();
  });

  it("pins to the bottom on a phone", () => {
    render(<AckBanner action={null} state="pending" />);
    expect(screen.getByTestId("ack-banner")).toHaveClass("max-md:fixed", "max-md:bottom-0");
  });

  it("shrinks to a quiet card with the date once done, and announces it", () => {
    render(<AckBanner ackedAt="2026-10-03T09:12:00Z" state="done" />);
    expect(screen.getByTestId("ack-banner")).toHaveAttribute("data-state", "done");
    expect(
      screen.getByText(`You acknowledged this policy on ${formatDate("2026-10-03T09:12:00Z")}.`),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Acknowledged");
  });
});
