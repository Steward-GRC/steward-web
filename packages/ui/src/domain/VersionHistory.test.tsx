// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { VersionHistory, type VersionHistoryGroup, versionLabel } from "./VersionHistory";

const groups: VersionHistoryGroup[] = [
  {
    current: true,
    events: [
      { at: "2026-11-05T10:00:00Z", detail: "Alice", title: "Published", tone: "published" },
    ],
    label: "v2",
    status: "published",
  },
  {
    current: false,
    events: [{ title: "Created", tone: "neutral" }],
    label: "v1",
    status: "superseded",
  },
];

describe("versionLabel (#89)", () => {
  it("shows a template version as plain vN", () => {
    expect(versionLabel("template", 3)).toBe("v3");
    expect(versionLabel("template", "3")).toBe("v3");
  });

  it("puts a template's semantic version beside its number, or the number alone without one (#390)", () => {
    expect(versionLabel("template", 3, "2.1.0")).toBe("v3 (2.1.0)");
    expect(versionLabel("template", 3, null)).toBe("v3");
    expect(versionLabel("template", 3, "")).toBe("v3");
  });

  it("shows a policy or procedure version as a semantic version", () => {
    expect(versionLabel("policy", "1.0.1")).toBe("v1.0.1");
    expect(versionLabel("procedure", "v2.1.0")).toBe("v2.1.0");
  });
});

describe("VersionHistory", () => {
  it("shows a note beside a version's label, such as its ordinal (#390)", () => {
    render(
      <VersionHistory
        groups={[{ ...groups[0]!, label: "v2.1.0", note: "Version 4" }]}
        title="Version history"
      />,
    );
    expect(screen.getByText("Version 4")).toBeInTheDocument();
  });

  it("draws one card with a group per version, the current one open", () => {
    render(<VersionHistory groups={groups} title="Version history" />);
    expect(screen.getByRole("heading", { name: "Version history" })).toBeInTheDocument();
    const current = screen.getByRole("button", { name: /v2/ });
    expect(current).toHaveAttribute("aria-expanded", "true");
    expect(within(screen.getByRole("list", { name: "v2" })).getByText("Published")).toBeVisible();
    expect(screen.getByRole("button", { name: /v1/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens an older version on a click", async () => {
    render(<VersionHistory groups={groups} title="Version history" />);
    await userEvent.click(screen.getByRole("button", { name: /v1/ }));
    expect(screen.getByRole("list", { name: "v1" })).toBeInTheDocument();
  });

  it("says so when there is no history", () => {
    render(<VersionHistory empty="Nothing yet" groups={[]} title="Version history" />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });
});
