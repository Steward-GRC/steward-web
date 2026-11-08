// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import type { LexicalEditor } from "lexical";

import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { $getRoot, $isTextNode } from "lexical";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { SerializedDocument } from "./document/tree";

import { type ReviewComments, type ReviewThreadView } from "./ReviewComments";
import { StewardEditor, type StewardEditorHandle } from "./StewardEditor";

const DOCUMENT: SerializedDocument = {
  root: {
    children: [
      {
        children: [
          {
            text: "Keep records for seven years. Then keep seven years more.",
            type: "text",
            version: 1,
          },
        ],
        type: "paragraph",
        version: 1,
      },
    ],
    type: "root",
  },
};

const THREAD: ReviewThreadView = {
  createdAt: "2026-11-06T12:00:00Z",
  id: "thread-1",
  messages: [
    {
      authorName: "Charlie",
      authorUserId: "user-charlie",
      body: "What is this?",
      createdAt: "2026-11-06T12:00:00Z",
      id: "m1",
    },
  ],
  occurrence: 2,
  quote: "seven years",
  resolved: false,
};

const empty = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  toJSON: () => ({}),
  top: 0,
  width: 0,
  x: 0,
  y: 0,
});

beforeAll(() => {
  Range.prototype.getBoundingClientRect ??= empty as () => DOMRect;
  Range.prototype.getClientRects ??= (() => []) as unknown as () => DOMRectList;
  document.elementFromPoint ??= () => null;
});

const comments = (overrides: Partial<ReviewComments> = {}): ReviewComments => ({
  meId: "user-bob",
  onReply: vi.fn(),
  onResolve: vi.fn(),
  threads: [THREAD],
  ...overrides,
});

const mount = async (props: Partial<Parameters<typeof StewardEditor>[0]> = {}) => {
  let handle: StewardEditorHandle | undefined;
  render(
    <StewardEditor
      initialDocument={DOCUMENT}
      onReady={(ready) => {
        handle = ready;
      }}
      {...props}
    />,
  );
  await waitFor(() => expect(handle).toBeDefined());
  await screen.findByText(/Keep records/);
  return handle!;
};

const lexicalEditor = (): LexicalEditor => {
  const box = screen.getAllByRole("textbox")[0] as {
    __lexicalEditor?: LexicalEditor;
  } & HTMLElement;
  return box.__lexicalEditor!;
};

describe("review threads in the editor", () => {
  it("highlights the thread's text, the second match of its quote", async () => {
    await mount({ review: comments() });
    await waitFor(() =>
      expect(document.querySelectorAll("mark[data-kg-comment-ids]")).toHaveLength(1),
    );
    const mark = document.querySelector("mark[data-kg-comment-ids]")!;
    expect(mark.textContent).toBe("seven years");
    expect(mark.previousSibling?.textContent).toContain("Then keep ");
  });

  it("lists the thread beside the document, naming who wrote what", async () => {
    await mount({ review: comments() });
    const panel = await screen.findByRole("region", { name: "Comments" });
    expect(within(panel).getByText(/What is this\?/)).toBeInTheDocument();
    expect(within(panel).getByText("Charlie")).toBeInTheDocument();
  });

  it("replies and resolves through the host", async () => {
    const review = comments();
    await mount({ review });
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Reply to this comment" }),
      "Fixed.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Reply" }));
    expect(review.onReply).toHaveBeenCalledWith("thread-1", "Fixed.");
    await userEvent.click(screen.getByRole("button", { name: "Resolve" }));
    expect(review.onResolve).toHaveBeenCalledWith("thread-1", true);
  });

  it("keeps the highlights out of the document it hands back", async () => {
    const handle = await mount({ review: comments() });
    await waitFor(() =>
      expect(document.querySelectorAll("mark[data-kg-comment-ids]")).toHaveLength(1),
    );
    expect(JSON.stringify(handle.getDocument())).not.toContain('"mark"');
  });

  it("starts a thread from the selection with the Comment button", async () => {
    const onAdd = vi.fn();
    await mount({ review: comments({ onAdd, threads: [] }) });
    await act(async () => {
      lexicalEditor().update(() => {
        const text = $getRoot().getAllTextNodes()[0];
        if ($isTextNode(text)) text.select(5, 12);
      });
      await Promise.resolve();
    });
    await userEvent.click(await screen.findByRole("button", { name: "Comment" }));
    await userEvent.type(await screen.findByRole("textbox", { name: "Comment" }), "Why?");
    await userEvent.click(screen.getByRole("button", { name: "Comment", description: "" }));
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({ body: "Why?", occurrence: 1, quote: "records" }),
    );
  });

  it("leaves the document at full width when there are no threads and no way to add one", async () => {
    await mount({ review: comments({ threads: [] }) });
    expect(screen.queryByRole("region", { name: "Comments" })).toBeNull();
  });

  it("has no Comment button when the host gives no way to add one", async () => {
    await mount({ review: comments({ threads: [] }) });
    await act(async () => {
      lexicalEditor().update(() => {
        const text = $getRoot().getAllTextNodes()[0];
        if ($isTextNode(text)) text.select(5, 12);
      });
      await Promise.resolve();
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole("button", { name: "Comment" })).toBeNull();
  });
});

// ---------------------------------------------------------------------------------------------
// Suggested changes on a thread (#253): replacement text for the quote, taken in turns.

const suggestion = (overrides: Record<string, unknown> = {}) => ({
  closedBy: null,
  closedText: null,
  outcome: null,
  reason: null,
  rounds: [
    {
      by: "REVIEWER",
      createdAt: "2026-11-06T12:00:00Z",
      text: "six years",
      userId: "user-charlie",
    },
  ],
  text: "six years",
  turn: "AUTHOR",
  ...overrides,
});

const withSuggestion = (
  over: Record<string, unknown> = {},
  thread: Partial<ReviewThreadView> = {},
): ReviewThreadView =>
  ({ ...THREAD, resolved: false, suggestion: suggestion(over), ...thread }) as ReviewThreadView;

const asSide = (
  side: "AUTHOR" | "REVIEWER",
  overrides: Partial<ReviewComments> = {},
): ReviewComments =>
  comments({
    onClose: vi.fn(),
    onCounter: vi.fn(),
    renderDiff: (before: string, after: string) => `[${before} -> ${after}]`,
    side,
    ...overrides,
  });

const documentText = (handle: StewardEditorHandle): string => {
  const words: string[] = [];
  const walk = (node: { children?: unknown[]; text?: unknown }) => {
    if (typeof node.text === "string") words.push(node.text);
    for (const child of node.children ?? []) walk(child as typeof node);
  };
  walk(handle.getDocument().root);
  return words.join("");
};

const highlighted = () =>
  waitFor(() =>
    expect(document.querySelectorAll("mark[data-kg-comment-ids]").length).toBeGreaterThan(0),
  );

describe("a suggestion on a thread", () => {
  it("shows the change, the round and whose turn it is", async () => {
    await mount({ review: asSide("AUTHOR", { threads: [withSuggestion()] }) });
    const panel = await screen.findByRole("region", { name: "Comments" });
    expect(within(panel).getByText("[seven years -> six years]")).toBeInTheDocument();
    expect(within(panel).getByText("Waiting for the author")).toBeInTheDocument();
  });

  it("counts the rounds and lists the earlier ones", async () => {
    const rounds = [
      { by: "REVIEWER", createdAt: "x", text: "six years", userId: "user-charlie" },
      { by: "AUTHOR", createdAt: "x", text: "five years", userId: "user-bob" },
    ];
    await mount({
      review: asSide("REVIEWER", {
        threads: [withSuggestion({ rounds, text: "five years", turn: "REVIEWER" })],
      }),
    });
    const panel = await screen.findByRole("region", { name: "Comments" });
    expect(within(panel).getByText(/Round 2/)).toBeInTheDocument();
    expect(within(panel).getByText("Waiting for the reviewer")).toBeInTheDocument();
    expect(within(panel).getByText("Earlier rounds")).toBeInTheDocument();
  });

  it("offers the author change, remove, counter and not agreed, and puts the text in the document", async () => {
    const review = asSide("AUTHOR", { threads: [withSuggestion()] });
    const handle = await mount({ review });
    await highlighted();
    for (const name of ["Change it", "Remove the note", "Counter", "Not agreed"]) {
      expect(await screen.findByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Change it" }));
    await waitFor(() =>
      expect(review.onClose).toHaveBeenCalledWith("thread-1", "CHANGED", undefined),
    );
    expect(documentText(handle)).toContain("Then keep six years more.");
    expect(documentText(handle)).toContain("for seven years.");
  });

  it("removes the note without touching the text", async () => {
    const review = asSide("AUTHOR", { threads: [withSuggestion()] });
    const handle = await mount({ review });
    await highlighted();
    await userEvent.click(await screen.findByRole("button", { name: "Remove the note" }));
    await waitFor(() =>
      expect(review.onClose).toHaveBeenCalledWith("thread-1", "REMOVED", undefined),
    );
    expect(documentText(handle)).toContain("Then keep seven years more.");
  });

  it("counters with other text", async () => {
    const review = asSide("AUTHOR", { threads: [withSuggestion()] });
    await mount({ review });
    await userEvent.click(await screen.findByRole("button", { name: "Counter" }));
    const field = screen.getByRole("textbox", { name: "Counter text" });
    await userEvent.clear(field);
    await userEvent.type(field, "five years");
    await userEvent.click(screen.getByRole("button", { name: "Send counter" }));
    expect(review.onCounter).toHaveBeenCalledWith("thread-1", "five years");
  });

  it("needs a reason to end it as not agreed", async () => {
    const review = asSide("AUTHOR", { threads: [withSuggestion()] });
    await mount({ review });
    await userEvent.click(await screen.findByRole("button", { name: "Not agreed" }));
    const end = screen.getByRole("button", { name: "End as not agreed" });
    expect(end).toBeDisabled();
    await userEvent.type(
      screen.getByRole("textbox", { name: "Why it is not agreed" }),
      "The law says seven.",
    );
    await userEvent.click(end);
    expect(review.onClose).toHaveBeenCalledWith("thread-1", "NOT_AGREED", "The law says seven.");
  });

  it("offers the reviewer accept on their turn, which agrees without changing the text", async () => {
    const turn = withSuggestion({
      rounds: [
        { by: "REVIEWER", createdAt: "x", text: "six years", userId: "user-charlie" },
        { by: "AUTHOR", createdAt: "x", text: "five years", userId: "user-bob" },
      ],
      text: "five years",
      turn: "REVIEWER",
    });
    const review = asSide("REVIEWER", { threads: [turn] });
    const handle = await mount({ readOnly: true, review });
    expect(screen.queryByRole("button", { name: "Change it" })).toBeNull();
    await userEvent.click(await screen.findByRole("button", { name: "Accept" }));
    await waitFor(() =>
      expect(review.onClose).toHaveBeenCalledWith("thread-1", "AGREED", undefined),
    );
    expect(documentText(handle)).toContain("Then keep seven years more.");
  });

  it("lets the reviewer who proposed withdraw while it is the author's turn, and nothing else", async () => {
    const review = asSide("REVIEWER", { threads: [withSuggestion()] });
    await mount({ readOnly: true, review });
    expect(await screen.findByRole("button", { name: "Withdraw" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Counter" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    expect(review.onClose).toHaveBeenCalledWith("thread-1", "WITHDRAWN", undefined);
  });

  it("keeps the thread and says so when the close is refused", async () => {
    const review = asSide("AUTHOR", {
      onClose: vi.fn().mockRejectedValue(new Error("not your turn")),
      threads: [withSuggestion()],
    });
    await mount({ review });
    await userEvent.click(await screen.findByRole("button", { name: "Remove the note" }));
    expect(
      await screen.findByText("The suggestion could not be closed. Try again."),
    ).toBeInTheDocument();
  });
});

describe("closed suggestions", () => {
  const closed = (outcome: string, extra: Record<string, unknown> = {}) =>
    withSuggestion(
      { closedBy: "user-bob", closedText: "six years", outcome, ...extra },
      { resolved: true },
    );

  it("lists them under Closed with the outcome, who closed them and the change", async () => {
    await mount({ review: asSide("AUTHOR", { threads: [closed("CHANGED")] }) });
    const panel = await screen.findByRole("region", { name: "Comments" });
    expect(within(panel).getByText("Closed (1)")).toBeInTheDocument();
    expect(within(panel).getByText("Changed")).toBeInTheDocument();
    expect(within(panel).getByText("[seven years -> six years]")).toBeInTheDocument();
  });

  it("gives the reason of one that was not agreed", async () => {
    await mount({
      review: asSide("AUTHOR", {
        threads: [closed("NOT_AGREED", { reason: "The law says seven." })],
      }),
    });
    expect(await screen.findByText("Reason: The law says seven.")).toBeInTheDocument();
  });

  it("leaves no highlight on a closed suggestion", async () => {
    await mount({ review: asSide("AUTHOR", { threads: [closed("REMOVED")] }) });
    await screen.findByText("Closed (1)");
    expect(document.querySelectorAll("mark[data-kg-comment-ids]")).toHaveLength(0);
  });

  it("offers the author an agreed text still to apply, and applies it", async () => {
    const review = asSide("AUTHOR", { threads: [closed("AGREED")] });
    const handle = await mount({ review });
    await userEvent.click(await screen.findByRole("button", { name: "Apply the agreed text" }));
    await waitFor(() => expect(documentText(handle)).toContain("Then keep six years more."));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Apply the agreed text" })).toBeNull(),
    );
  });
});

describe("who sees which toolbar", () => {
  const select = async () => {
    await act(async () => {
      lexicalEditor().update(() => {
        const text = $getRoot().getAllTextNodes()[0];
        if ($isTextNode(text)) text.select(5, 12);
      });
      await Promise.resolve();
    });
  };

  // Needs the base editor to show a read-only action in a non-editable editor (node-koenig-editor,
  // toolbar actions with readOnly: true). Remove `.fails` once Steward pins that release.
  it.fails("gives the reviewer one button, Comment, and no formatting", async () => {
    await mount({
      readOnly: true,
      review: asSide("REVIEWER", { onAdd: vi.fn(), threads: [] }),
    });
    await select();
    expect(await screen.findByRole("button", { name: "Comment" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bold" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Italic" })).toBeNull();
  });

  it("gives the author the formatting buttons and no Comment button", async () => {
    await mount({ review: asSide("AUTHOR", { threads: [] }) });
    await select();
    expect(await screen.findByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Comment" })).toBeNull();
  });
});

describe("the Comment card with a suggested text", () => {
  const open = async (onAdd: ReturnType<typeof vi.fn>) => {
    await mount({ readOnly: true, review: asSide("REVIEWER", { onAdd, threads: [] }) });
    await act(async () => {
      lexicalEditor().update(() => {
        const text = $getRoot().getAllTextNodes()[0];
        if ($isTextNode(text)) text.select(5, 12);
      });
      await Promise.resolve();
    });
    await userEvent.click(await screen.findByRole("button", { name: "Comment" }));
  };

  it("starts with the selected words, so a change to them is the suggestion", async () => {
    const onAdd = vi.fn();
    await open(onAdd);
    const field = await screen.findByRole("textbox", { name: "Suggested text (optional)" });
    expect(field).toHaveValue("records");
    await userEvent.type(await screen.findByRole("textbox", { name: "Comment" }), "Better word?");
    await userEvent.clear(field);
    await userEvent.type(field, "documents");
    await userEvent.click(screen.getByRole("button", { name: "Comment", description: "" }));
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({
        body: "Better word?",
        occurrence: 1,
        quote: "records",
        suggestedText: "documents",
      }),
    );
  });

  it("sends no suggestion when the words are left as they are", async () => {
    const onAdd = vi.fn();
    await open(onAdd);
    await userEvent.type(await screen.findByRole("textbox", { name: "Comment" }), "Why?");
    await userEvent.click(screen.getByRole("button", { name: "Comment", description: "" }));
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({ body: "Why?", occurrence: 1, quote: "records" }),
    );
  });
});
