// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiReviewSheet, RewriteSectionDialog, SuggestionSheet } from "./AiOverlays";

const SECTIONS = [
  { key: "purpose", title: "1. Purpose" },
  { key: "signing-in", title: "2. Signing in" },
  { key: "records", title: "3. Visitor records" },
];

describe("Rewrite a section (D13)", () => {
  it("asks for the section, Rewrite or Clarify, and an optional instruction", async () => {
    const suggest = vi.fn();
    render(
      <RewriteSectionDialog onOpenChange={() => {}} onSuggest={suggest} open sections={SECTIONS} />,
    );
    const dialog = screen.getByRole("dialog", { name: "Rewrite a section" });
    await userEvent.selectOptions(
      within(dialog).getByRole("combobox", { name: "Section" }),
      "3. Visitor records",
    );
    await userEvent.click(within(dialog).getByRole("radio", { name: "Clarify" }));
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "Instruction (optional)" }),
      "say 12 months",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Suggest" }));
    expect(suggest).toHaveBeenCalledWith({
      choice: "clarify",
      instruction: "say 12 months",
      sectionKey: "records",
    });
  });

  it("starts on Rewrite and the first section", async () => {
    const suggest = vi.fn();
    render(
      <RewriteSectionDialog onOpenChange={() => {}} onSuggest={suggest} open sections={SECTIONS} />,
    );
    expect(screen.getByRole("radio", { name: "Rewrite" })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Suggest" }));
    expect(suggest).toHaveBeenCalledWith({
      choice: "rewrite",
      instruction: "",
      sectionKey: "purpose",
    });
  });
});

describe("Review suggestion (D13)", () => {
  it("shows the original beside the suggestion and applies it", async () => {
    const apply = vi.fn();
    render(
      <SuggestionSheet
        onApply={apply}
        onOpenChange={() => {}}
        open
        original="Their host meets them at the front desk."
        suggested="Their host comes to the front desk to meet them."
      />,
    );
    const sheet = screen.getByRole("dialog", { name: "Review suggestion" });
    expect(within(sheet).getByRole("region", { name: "Original" })).toHaveTextContent(
      "Their host meets them at the front desk.",
    );
    expect(within(sheet).getByRole("region", { name: "Suggested" })).toHaveTextContent(
      "Their host comes to the front desk to meet them.",
    );
    await userEvent.click(within(sheet).getByRole("button", { name: "Apply to draft" }));
    expect(apply).toHaveBeenCalled();
  });

  it("discards without applying", async () => {
    const apply = vi.fn();
    const openChange = vi.fn();
    render(
      <SuggestionSheet onApply={apply} onOpenChange={openChange} open original="A" suggested="B" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(openChange).toHaveBeenCalledWith(false);
    expect(apply).not.toHaveBeenCalled();
  });

  it("shows progress while the suggestion is on its way, and no Apply", () => {
    render(
      <SuggestionSheet
        onApply={() => {}}
        onOpenChange={() => {}}
        open
        original="A"
        stage="generating"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Generating");
    expect(screen.queryByRole("button", { name: "Apply to draft" })).toBeNull();
  });
});

describe("AI review (D13)", () => {
  const findings = [
    { finding: "No retention period", sectionKey: "records", severity: "warn" as const },
    { finding: "Section 3 is empty", sectionKey: "records", severity: "blocker" as const },
    {
      finding: "Defined term not linked",
      sectionKey: "signing-in",
      severity: "info" as const,
      suggestion: "Attach Host as a definition.",
    },
  ];

  it("groups the findings as Blocker, Warning and Note, each with a jump to its section", async () => {
    const jump = vi.fn();
    render(
      <AiReviewSheet
        findings={findings}
        onJump={jump}
        onOpenChange={() => {}}
        onRerun={() => {}}
        open
        sections={SECTIONS}
        stage="done"
      />,
    );
    const sheet = screen.getByRole("dialog", { name: "AI review" });
    expect(sheet).toHaveAccessibleDescription(
      "A pre-submit gap check of this draft. Findings are advisory, and nothing in the draft changes.",
    );
    const items = within(sheet).getAllByRole("listitem");
    expect(items.map((item) => within(item).getByRole("heading").textContent)).toEqual([
      "Blocker · Section 3 is empty",
      "Warning · No retention period",
      "Note · Defined term not linked",
    ]);
    expect(items[2]).toHaveTextContent("Attach Host as a definition.");
    await userEvent.click(within(items[2]!).getByRole("button", { name: "Jump to §2" }));
    expect(jump).toHaveBeenCalledWith("signing-in");
  });

  it("says No gaps found, and re-runs", async () => {
    const rerun = vi.fn();
    render(
      <AiReviewSheet
        findings={[]}
        onJump={() => {}}
        onOpenChange={() => {}}
        onRerun={rerun}
        open
        sections={SECTIONS}
        stage="done"
      />,
    );
    expect(screen.getByText("No gaps found")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Re-run review" }));
    expect(rerun).toHaveBeenCalled();
  });

  it("shows progress while the review runs", () => {
    render(
      <AiReviewSheet
        findings={[]}
        onJump={() => {}}
        onOpenChange={() => {}}
        onRerun={() => {}}
        open
        sections={SECTIONS}
        stage="queued"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Queued");
    expect(screen.queryByText("No gaps found")).toBeNull();
  });
});
