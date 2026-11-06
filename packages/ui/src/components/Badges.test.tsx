// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge, CountBadge, documentStatusOf, StatusPill, Tally, VersionBadge } from "./Badges";

describe("StatusPill", () => {
  it.each([
    ["draft", "Draft"],
    ["in-review", "In review"],
    ["approved", "Approved"],
    ["published", "Published"],
    ["retired", "Retired"],
  ] as const)("names %s with the one vocabulary", (status, word) => {
    render(<StatusPill status={status} />);
    expect(screen.getByText(word)).toBeInTheDocument();
  });
});

describe("documentStatusOf", () => {
  it("maps the workflow's statuses onto the vocabulary", () => {
    expect(documentStatusOf("APPROVAL_STATUS_DRAFT")).toBe("draft");
    expect(documentStatusOf("APPROVAL_STATUS_IN_REVIEW")).toBe("in-review");
    expect(documentStatusOf("APPROVAL_STATUS_SCHEDULED")).toBe("approved");
    expect(documentStatusOf("APPROVAL_STATUS_PUBLISHED")).toBe("published");
    expect(documentStatusOf("APPROVAL_STATUS_ARCHIVED")).toBe("retired");
    expect(documentStatusOf("APPROVAL_STATUS_UNSPECIFIED")).toBe("draft");
  });

  it("gives no pill for rejected, superseded and withdrawn: they're history events", () => {
    expect(documentStatusOf("APPROVAL_STATUS_REJECTED")).toBeNull();
    expect(documentStatusOf("APPROVAL_STATUS_SUPERSEDED")).toBeNull();
    expect(documentStatusOf("APPROVAL_STATUS_WITHDRAWN")).toBeNull();
  });
});

describe("VersionBadge", () => {
  it("shows the number and the change type", () => {
    render(<VersionBadge change="major" version="v3.0.0" />);
    expect(screen.getByText("v3.0.0")).toBeInTheDocument();
    expect(screen.getByText("Major")).toBeInTheDocument();
  });
});

describe("CountBadge", () => {
  it("is an amber pill with dark text, so a count stands out", () => {
    render(<CountBadge>3</CountBadge>);
    expect(screen.getByText("3")).toHaveClass("bg-accent-fill", "text-on-accent", "rounded-[10px]");
  });

  it("takes extra classes", () => {
    render(<CountBadge className="ml-auto">3</CountBadge>);
    expect(screen.getByText("3")).toHaveClass("ml-auto");
  });
});

describe("Tally", () => {
  it("is the one amber tally style, with dark text on amber for contrast", () => {
    render(<Tally>14</Tally>);
    expect(screen.getByText("14")).toHaveClass("bg-accent-fill", "text-on-accent", "font-mono");
    expect(screen.getByText("14")).toHaveAttribute("data-tally", "sm");
  });

  it("has a large size for headline figures", () => {
    render(<Tally size="lg">80%</Tally>);
    expect(screen.getByText("80%")).toHaveAttribute("data-tally", "lg");
    expect(screen.getByText("80%")).toHaveClass("bg-accent-fill", "text-[22px]");
  });
});

describe("Badge", () => {
  it("is a pill in the tone's colours", () => {
    render(<Badge tone="danger">3 days overdue</Badge>);
    expect(screen.getByText("3 days overdue")).toHaveClass(
      "rounded-full",
      "bg-danger-soft",
      "text-danger",
    );
  });

  it("defaults to neutral", () => {
    render(<Badge>Draft</Badge>);
    expect(screen.getByText("Draft")).toHaveClass("bg-neutral-soft");
  });

  it("can be the small square-cornered tag", () => {
    render(<Badge shape="tag">Upcoming</Badge>);
    expect(screen.getByText("Upcoming")).toHaveClass("rounded-[4px]", "text-[11px]");
    expect(screen.getByText("Upcoming")).not.toHaveClass("rounded-full", "h-6");
  });
});
