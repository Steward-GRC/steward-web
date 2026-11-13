// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChangeTypeSummary } from "./ChangeTypeSummary";

const none = {
  agreedByUserIds: [],
  changeType: null,
  reason: null,
  requestedChangeType: null,
  setByUserId: null,
  suggestedChangeType: null,
} as const;

const names = { "u-1": "Bob Author", "u-7": "Dana Approver", "u-8": "Eli Approver" };

describe("ChangeTypeSummary (#390)", () => {
  it("says nothing when core has no change type for the version", () => {
    const { container } = render(<ChangeTypeSummary change={none} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the suggestion and what it applies as when nobody changed it", () => {
    render(
      <ChangeTypeSummary change={{ ...none, changeType: "minor", suggestedChangeType: "minor" }} />,
    );
    const card = screen.getByRole("region", { name: "Change type" });
    expect(within(card).getByText("Suggested")).toBeInTheDocument();
    expect(within(card).getByText("Applied")).toBeInTheDocument();
    expect(within(card).getAllByText("Minor")).toHaveLength(2);
    expect(within(card).queryByText("Requested")).toBeNull();
    expect(within(card).queryByText("Agreed by")).toBeNull();
  });

  it("shows a lowering that waits for the first approval stage, with its reason", () => {
    render(
      <ChangeTypeSummary
        change={{
          ...none,
          changeType: "major",
          reason: "Only a typo moved.",
          requestedChangeType: "fix",
          setByUserId: "u-1",
          suggestedChangeType: "major",
        }}
        names={names}
      />,
    );
    const card = screen.getByRole("region", { name: "Change type" });
    expect(within(card).getByText("Requested")).toBeInTheDocument();
    expect(within(card).getByText("Fix")).toBeInTheDocument();
    expect(
      within(card).getByText("Waiting for the first approval stage to agree."),
    ).toBeInTheDocument();
    expect(within(card).getByText("Only a typo moved.")).toBeInTheDocument();
    expect(within(card).getByText("Set by")).toBeInTheDocument();
    expect(within(card).getByText("Bob Author")).toBeInTheDocument();
    expect(within(card).getByText("Agreed by")).toBeInTheDocument();
    expect(within(card).getByText("Nobody yet")).toBeInTheDocument();
  });

  it("names who agreed to an applied lowering, by label", () => {
    render(
      <ChangeTypeSummary
        change={{
          ...none,
          agreedByUserIds: ["u-7", "u-8"],
          changeType: "fix",
          reason: "Only a typo moved.",
          setByUserId: "u-1",
          suggestedChangeType: "major",
        }}
        names={names}
      />,
    );
    const card = screen.getByRole("region", { name: "Change type" });
    expect(within(card).getByText("Dana Approver, Eli Approver")).toBeInTheDocument();
    expect(within(card).queryByText("Requested")).toBeNull();
  });

  it("falls back to the id for someone the labels did not resolve", () => {
    render(
      <ChangeTypeSummary
        change={{
          ...none,
          agreedByUserIds: ["u-9"],
          changeType: "fix",
          suggestedChangeType: "minor",
        }}
        names={{}}
      />,
    );
    expect(screen.getByText("u-9")).toBeInTheDocument();
  });
});
