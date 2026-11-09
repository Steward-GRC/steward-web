// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The reviewer's editor: the Steward editor, reduced to reading the version and commenting on it.
// Its content looks like the policy everywhere else, its comments sit under it, and it takes no edit.
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { SerializedDocument } from "./document/tree";

import { type ReviewComments, type ReviewThreadView } from "./ReviewComments";
import { ReviewerEditor } from "./ReviewerEditor";
import { type StewardEditorHandle } from "./StewardEditor";

const DOCUMENT: SerializedDocument = {
  root: {
    children: [
      {
        children: [{ text: "Keep records for seven years.", type: "text", version: 1 }],
        type: "paragraph",
        version: 1,
      },
    ],
    type: "root",
  },
};

const THREAD: ReviewThreadView = {
  approverUserId: "user-charlie",
  createdAt: "2026-11-06T12:00:00Z",
  id: "thread-1",
  messages: [
    {
      authorName: "Charlie",
      authorUserId: "user-charlie",
      body: "Why seven?",
      createdAt: "2026-11-06T12:00:00Z",
      id: "m1",
    },
  ],
  occurrence: 1,
  quote: "seven years",
  resolved: false,
};

beforeAll(() => {
  Range.prototype.getBoundingClientRect ??= (() => ({})) as () => DOMRect;
  Range.prototype.getClientRects ??= (() => []) as unknown as () => DOMRectList;
  document.elementFromPoint ??= () => null;
});

const review = (overrides: Partial<ReviewComments> = {}): ReviewComments => ({
  meId: "user-charlie",
  onAdd: vi.fn(),
  onReply: vi.fn(),
  onResolve: vi.fn(),
  side: "REVIEWER",
  threads: [THREAD],
  ...overrides,
});

const mount = async (comments = review()) => {
  let handle: StewardEditorHandle | undefined;
  render(
    <ReviewerEditor
      initialDocument={DOCUMENT}
      onReady={(ready) => {
        handle = ready;
      }}
      review={comments}
    />,
  );
  await waitFor(() => expect(handle).toBeDefined());
  await screen.findByText(/Keep records/);
  return handle!;
};

const textOf = (handle: StewardEditorHandle) => JSON.stringify(handle.getDocument());

describe("the reviewer's editor", () => {
  it("is read-only", async () => {
    await mount();
    expect(screen.getAllByRole("textbox")[0]).toHaveAttribute("contenteditable", "false");
  });

  it("draws the content as the policy reads everywhere else", async () => {
    await mount();
    const page = document.querySelector("[data-reviewer-document]") as HTMLElement;
    expect(page).not.toBeNull();
    for (const name of ["rounded-[10px]", "border", "border-border", "bg-surface", "font-serif"]) {
      expect(page.classList.contains(name), name).toBe(true);
    }
    expect(page.contains(screen.getByText(/Keep records/))).toBe(true);
  });

  it("keeps the word count outside the page, not in the box (bug log 242)", async () => {
    await mount();
    const page = document.querySelector("[data-reviewer-document]") as HTMLElement;
    const count = await screen.findByText(/\bwords?$/);
    expect(page.contains(count)).toBe(false);
  });

  it("puts the comments under the content, headed with how many there are", async () => {
    await mount();
    const panel = await screen.findByRole("region", { name: "Comments (1)" });
    const page = document.querySelector("[data-reviewer-document]") as HTMLElement;
    expect(
      page.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING,
      "the panel follows the content",
    ).toBeTruthy();
    expect(within(panel).getByText(/Why seven\?/)).toBeInTheDocument();
    // not a column beside the content
    expect(panel.parentElement?.className).not.toMatch(/lg:flex-row/);
  });

  it("says when there are no comments yet", async () => {
    await mount(review({ threads: [] }));
    expect(await screen.findByRole("region", { name: "Comments (0)" })).toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("takes no typed text or paste", async () => {
    const handle = await mount();
    const root = screen.getAllByRole("textbox")[0] as HTMLElement;
    const before = textOf(handle);
    await act(async () => {
      root.dispatchEvent(
        new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          data: "x",
          inputType: "insertText",
        }),
      );
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(textOf(handle)).toBe(before);
  });
});
