// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type MagicLinkRow, MagicLinksTable } from "./MagicLinksTable";

const LINKS: MagicLinkRow[] = [
  {
    createdAt: "2026-10-02T12:00:00Z",
    createdBy: "Bob",
    id: "l-1",
    policyTitle: "Desk Booking Policy",
    status: "active",
    url: "https://policies.example.org/share/7c1e04b2",
    version: "v1.0.0",
  },
  {
    createdAt: "2026-09-12T12:00:00Z",
    createdBy: "Bob",
    id: "l-2",
    policyTitle: "Travel Booking Procedure",
    status: "revoked",
    url: "https://policies.example.org/share/a90b11c3",
    version: "v2.0.0",
  },
];

describe("the magic links table (A12)", () => {
  it("lists policy, version, a short link with copy, status and who made it", () => {
    render(<MagicLinksTable links={LINKS} onRemove={vi.fn()} onRevoke={vi.fn()} />);
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Policy",
      "Version",
      "Link",
      "Status",
      "Created by",
      "Actions",
    ]);
    const [, active, revoked] = screen.getAllByRole("row");
    expect(within(active!).getByText("…/share/7c1e")).toBeInTheDocument();
    expect(within(active!).getByText("Active")).toBeInTheDocument();
    expect(within(active!).getByText("Bob · 2 Oct")).toBeInTheDocument();
    expect(within(revoked!).getByText("Revoked")).toBeInTheDocument();
  });

  it("copies an active link and revokes it", async () => {
    const writeText = vi.fn(async (_text: string) => {});
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const onRevoke = vi.fn();
    render(<MagicLinksTable links={LINKS} onRemove={vi.fn()} onRevoke={onRevoke} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Copy the link to Desk Booking Policy" }),
    );
    expect(writeText).toHaveBeenCalledWith(LINKS[0]!.url);
    await userEvent.click(
      screen.getByRole("button", { name: "Revoke the link to Desk Booking Policy" }),
    );
    expect(onRevoke).toHaveBeenCalledWith("l-1");
  });

  it("removes a revoked link only after asking (D34)", async () => {
    const onRemove = vi.fn();
    render(<MagicLinksTable links={LINKS} onRemove={onRemove} onRevoke={vi.fn()} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Remove the link to Travel Booking Procedure" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Remove this magic link?" });
    expect(
      within(dialog).getByText("Anyone holding the URL will no longer be able to reach it."),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove link" }));
    expect(onRemove).toHaveBeenCalledWith("l-2");
  });

  it("says when there are no links", () => {
    render(<MagicLinksTable links={[]} onRemove={vi.fn()} onRevoke={vi.fn()} />);
    expect(screen.getByText("No magic links")).toBeInTheDocument();
  });
});
