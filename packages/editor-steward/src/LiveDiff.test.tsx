// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type SerializedNode, wrapRoot } from "./document/tree";
import { StewardEditor, type StewardEditorHandle } from "./StewardEditor";

const text = (value: string): SerializedNode => ({
  detail: 0,
  format: 0,
  mode: "normal",
  style: "",
  text: value,
  type: "text",
  version: 1,
});
const paragraph = (value: string): SerializedNode => ({
  children: [text(value)],
  direction: null,
  format: "",
  indent: 0,
  type: "paragraph",
  version: 1,
});
const document = (...lines: string[]) => wrapRoot(lines.map((line) => paragraph(line)));

const highlights = new Map<string, Set<Range>>();

beforeEach(() => {
  highlights.clear();
  vi.stubGlobal("CSS", { highlights, escape: (value: string) => value });
  vi.stubGlobal(
    "Highlight",
    class extends Set<Range> {
      constructor(...ranges: Range[]) {
        super(ranges);
      }
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

const mount = async (props: Partial<Parameters<typeof StewardEditor>[0]>) => {
  let handle: StewardEditorHandle | undefined;
  const view = render(
    <StewardEditor
      initialDocument={document("File within 30 days.", "Second block stays.")}
      onReady={(ready) => {
        handle = ready;
      }}
      {...props}
    />,
  );
  await waitFor(() => expect(handle).toBeDefined());
  return { handle: handle!, view };
};

const painted = (name: string) =>
  [...(highlights.get(name) ?? [])].map((range) => range.toString());

describe("the live diff in the editor (bug log 228)", () => {
  it("paints the new words where they stand, and nothing else", async () => {
    await mount({
      liveDiff: { published: document("File within 60 days.", "Second block stays.") },
    });
    await waitFor(() => expect(painted("steward-diff-added")).toEqual(["30"]));
  });

  it("marks where the old words stood, and says what they were", async () => {
    await mount({
      liveDiff: { published: document("File within 60 days.", "Second block stays.") },
    });
    const marker = await screen.findByLabelText("Removed: 60");
    expect(marker).toHaveAttribute("data-diff-removed", "");
  });

  it("shows nothing without a published text to compare to", async () => {
    await mount({});
    expect(highlights.size).toBe(0);
    expect(screen.queryByLabelText(/^Removed:/)).toBeNull();
  });

  it("never puts the diff in the document, so nothing reaches a collaboration room", async () => {
    const { handle } = await mount({
      liveDiff: { published: document("File within 60 days.", "Second block stays.") },
    });
    await waitFor(() => expect(painted("steward-diff-added")).toEqual(["30"]));
    expect(JSON.stringify(handle.getDocument())).not.toContain("steward-diff");
    expect(JSON.stringify(handle.getDocument())).not.toContain("Removed");
  });

  it("takes the paint off when the view goes back to unified", async () => {
    const { view } = await mount({
      liveDiff: { published: document("File within 60 days.", "Second block stays.") },
    });
    await waitFor(() => expect(painted("steward-diff-added")).toEqual(["30"]));
    view.rerender(
      <StewardEditor initialDocument={document("File within 30 days.", "Second block stays.")} />,
    );
    await waitFor(() => expect(painted("steward-diff-added")).toEqual([]));
    expect(screen.queryByLabelText(/^Removed:/)).toBeNull();
  });

  it("follows the typing: a word added to the document is painted too", async () => {
    const { handle } = await mount({
      liveDiff: { published: document("File within 30 days.", "Second block stays.") },
    });
    await waitFor(() => expect(handle.getDocument()).toBeDefined());
    expect(painted("steward-diff-added")).toEqual([]);
    handle.setDocument(document("File within 30 days now.", "Second block stays."));
    await waitFor(() => expect(painted("steward-diff-added")).toEqual(["now"]));
  });
});
