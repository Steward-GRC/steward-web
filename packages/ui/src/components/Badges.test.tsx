// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { documentStatusOf, StatusPill, VersionBadge } from "./Badges";

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
});

describe("VersionBadge", () => {
  it("shows the number and the change type", () => {
    render(<VersionBadge change="major" version="v3.0.0" />);
    expect(screen.getByText("v3.0.0")).toBeInTheDocument();
    expect(screen.getByText("Major")).toBeInTheDocument();
  });
});
