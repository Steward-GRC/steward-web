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
