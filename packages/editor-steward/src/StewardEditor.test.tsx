// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import originalDocument from "./__fixtures__/originalDocument.json";
import { countNodeTypes, parseDocument, type SerializedDocument } from "./document/tree";
import { LexicalDocumentView } from "./LexicalDocumentView";
import { StewardEditor, type StewardEditorHandle } from "./StewardEditor";

const fixture = parseDocument(JSON.stringify(originalDocument))!;

const mount = async (props: Partial<Parameters<typeof StewardEditor>[0]> = {}) => {
  let handle: StewardEditorHandle | undefined;
  const view = render(
    <StewardEditor
      initialDocument={fixture}
      onReady={(ready) => {
        handle = ready;
      }}
      {...props}
    />,
  );
  await waitFor(() => expect(handle).toBeDefined());
  return { handle: handle!, view };
};

describe("StewardEditor", () => {
  it("mounts an original-shape document and shows its content", async () => {
    await mount();
    expect(await screen.findByText("Purpose")).toBeInTheDocument();
    expect(screen.getByText("Aspirin")).toBeInTheDocument();
    expect(screen.getByText("@Sam Rivera")).toBeInTheDocument();
  });

  it("hands back the document it loaded, with every node kept", async () => {
    const { handle } = await mount();
    const document = handle.getDocument();
    expect(countNodeTypes(document)).toEqual(countNodeTypes(fixture));
    expect(JSON.stringify(document)).toContain(
      '"footnoteId":"5f0c2a8e-1d2b-4c1a-9a51-3c1f0e6b7d42"',
    );
  });

  it("lifts an image the old editor kept inside a paragraph into a card after it", async () => {
    const { handle } = await mount();
    const { children: blocks } = handle.getDocument().root;
    const diagram = blocks.findIndex((node) => JSON.stringify(node).includes("Diagram: "));
    expect(JSON.stringify(blocks[diagram])).not.toContain('"type":"image"');
    expect(blocks[diagram + 1]).toMatchObject({
      alt: "Escalation flow",
      height: 240,
      src: "https://files.example.test/escalation.png",
      type: "image",
      width: 480,
    });
  });

  it("takes a whole new document from the host", async () => {
    const { handle } = await mount();
    const replacement: SerializedDocument = {
      root: {
        children: [
          {
            children: [{ text: "Replaced", type: "text", version: 1 }],
            type: "paragraph",
            version: 1,
          },
        ],
        type: "root",
      },
    };
    handle.setDocument(replacement);
    expect(await screen.findByText("Replaced")).toBeInTheDocument();
  });

  it("offers a text box to type in, and makes it read-only on request", async () => {
    const editable = await mount();
    for (const box of await screen.findAllByRole("textbox")) {
      expect(box).not.toHaveAttribute("aria-readonly");
    }
    editable.view.unmount();

    await mount({ readOnly: true });
    await waitFor(() => {
      for (const box of screen.getAllByRole("textbox")) {
        expect(box).toHaveAttribute("aria-readonly", "true");
      }
    });
  });
});

describe("LexicalDocumentView", () => {
  it("renders the stored document on the server, without a browser", () => {
    const view = renderToString(<LexicalDocumentView document={fixture} />);
    expect(view).toContain("<h1>");
    expect(view).toContain("Purpose");
    expect(view).toContain("<table>");
    expect(view).toContain("Aspirin");
    expect(view).toContain('src="https://files.example.test/escalation.png"');
  });

  it("refuses a script link", () => {
    const document = parseDocument(
      JSON.stringify({
        root: {
          children: [
            {
              children: [
                {
                  children: [{ text: "click", type: "text" }],
                  type: "link",
                  url: "javascript:alert(1)",
                },
              ],
              type: "paragraph",
            },
          ],
          type: "root",
        },
      }),
    );
    expect(renderToString(<LexicalDocumentView document={document} />)).not.toContain(
      "javascript:",
    );
  });
});
