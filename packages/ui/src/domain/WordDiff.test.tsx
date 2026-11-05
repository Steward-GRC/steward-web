// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DiffCounts, DiffView, FoldedRun, parseWordDiff, WordDiff, wordDiffRuns } from "./WordDiff";

const claim =
  "File your claim within <del>60</del> <ins>30</ins> days of spending the money, using the expenses page.";
const receipts =
  "Attach a receipt for every item. <del>Post the original to the finance team.</del> <ins>A clear photo of the receipt is enough.</ins>";

describe("parseWordDiff", () => {
  it("splits the gateway's diff into same, added and removed runs", () => {
    expect(parseWordDiff("within <del>60</del> <ins>30</ins> days")).toEqual([
      { kind: "same", text: "within " },
      { kind: "removed", text: "60" },
      { kind: "same", text: " " },
      { kind: "added", text: "30" },
      { kind: "same", text: " days" },
    ]);
  });

  it("decodes entities and drops any other markup instead of rendering it", () => {
    expect(
      parseWordDiff("<p>A &amp; B &lt;b&gt; <script>x</script><ins>&quot;C&#39;</ins></p>"),
    ).toEqual([
      { kind: "same", text: "A & B <b> x" },
      { kind: "added", text: "\"C'" },
    ]);
  });
});

describe("the word-level diff (U12, U25)", () => {
  it("marks added and removed words so they read without colour", () => {
    render(<WordDiff html={claim} />);
    const removed = screen.getByText("60");
    const added = screen.getByText("30");
    expect(removed.tagName).toBe("DEL");
    expect(removed).toHaveAttribute("aria-label", "removed: 60");
    expect(added.tagName).toBe("INS");
    expect(added).toHaveAttribute("aria-label", "added: 30");
  });

  it("never renders markup from the diff", () => {
    render(<WordDiff html={"<ins><img src=x onerror=alert(1)>ok</ins>"} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("ok").tagName).toBe("INS");
  });

  it("counts the changes as +n −m", () => {
    render(<DiffCounts added={3} removed={2} />);
    expect(screen.getByRole("img", { name: "3 added, 2 removed" })).toHaveTextContent("+3 −2");
  });

  it("folds an unchanged run and shows it on request", async () => {
    render(
      <FoldedRun count={4}>
        <p>The quiet middle of the policy.</p>
      </FoldedRun>,
    );
    expect(screen.getByText("4 unchanged paragraphs")).toBeInTheDocument();
    expect(screen.queryByText("The quiet middle of the policy.")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Show 4 unchanged paragraphs" }));
    expect(screen.getByText("The quiet middle of the policy.")).toBeInTheDocument();
  });
});

describe("the changes view", () => {
  const sections = [
    {
      changeType: "modified",
      sectionKey: "claim",
      sectionTitle: "2. Making a claim",
      wordDiffHtml: claim,
    },
    {
      changeType: "modified",
      sectionKey: "receipts",
      sectionTitle: "3. Receipts",
      wordDiffHtml: receipts,
    },
  ];

  it("shows the counts, the legend and each changed section in the reading face", () => {
    render(<DiffView sections={sections} />);
    expect(screen.getByRole("img", { name: "2 added, 2 removed" })).toHaveTextContent("+2 −2");
    expect(screen.getByText("added in the newer version")).toBeInTheDocument();
    expect(screen.getByText("removed from the older version")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "2. Making a claim" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "3. Receipts" })).toBeInTheDocument();
  });

  it("switches between unified and side by side", async () => {
    render(<DiffView sections={sections} />);
    const unified = screen.getByRole("radio", { name: "Unified" });
    expect(unified).toBeChecked();
    expect(screen.getAllByText("60")).toHaveLength(1);
    await userEvent.click(screen.getByRole("radio", { name: "Side by side" }));
    const older = screen.getByRole("region", { name: "Older version" });
    const newer = screen.getByRole("region", { name: "Newer version" });
    expect(within(older).getByText("60").tagName).toBe("DEL");
    expect(within(older).queryByText("30")).toBeNull();
    expect(within(newer).getByText("30").tagName).toBe("INS");
    expect(within(newer).queryByText("60")).toBeNull();
  });

  it("folds unchanged sections between the changes", () => {
    render(<DiffView sections={sections} unchangedBefore={{ receipts: 4 }} />);
    expect(screen.getByText("4 unchanged paragraphs")).toBeInTheDocument();
  });
});

describe("wordDiffRuns", () => {
  it("marks the words added and removed between two texts", () => {
    expect(
      wordDiffRuns(
        "Tell the service desk within one hour.",
        "Tell the service desk within one hour, then follow section 5.",
      ),
    ).toEqual([
      { kind: "same", text: "Tell the service desk within one " },
      { kind: "removed", text: "hour." },
      { kind: "added", text: "hour, then follow section 5." },
    ]);
  });

  it("is all same for identical text, and all added from nothing", () => {
    expect(wordDiffRuns("Same text", "Same text")).toEqual([{ kind: "same", text: "Same text" }]);
    expect(wordDiffRuns("", "New")).toEqual([{ kind: "added", text: "New" }]);
  });

  it("renders as the diff when handed straight to WordDiff", () => {
    render(
      <p>
        <WordDiff runs={wordDiffRuns("Keep old", "Keep new")} />
      </p>,
    );
    expect(screen.getByRole("deletion")).toHaveTextContent("old");
    expect(screen.getByRole("insertion")).toHaveTextContent("new");
  });
});
