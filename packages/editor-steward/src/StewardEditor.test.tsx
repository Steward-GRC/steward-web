// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/* oxlint-disable testing-library/no-node-access, testing-library/no-container */
import { act, render, screen, waitFor } from "@testing-library/react";
import {
  $getRoot,
  $isElementNode,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  type LexicalEditor,
} from "lexical";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import originalDocument from "./__fixtures__/originalDocument.json";
import {
  missingRequiredSections,
  scaffoldFromTemplate,
  type TemplateSectionOutline,
} from "./document";
import { countNodeTypes, parseDocument, type SerializedDocument } from "./document/tree";
import { LexicalDocumentView } from "./LexicalDocumentView";
import { StewardEditor, type StewardEditorHandle } from "./StewardEditor";

const codeText = (document: SerializedDocument): string => {
  const parts: string[] = [];
  const walk = (node: { children?: unknown[]; text?: string; type: string }, inCode: boolean) => {
    const code = inCode || node.type === "code";
    if (code && node.type !== "code" && typeof node.text === "string") parts.push(node.text);
    for (const child of node.children ?? []) walk(child as typeof node, code);
  };
  walk(document.root as Parameters<typeof walk>[0], false);
  return parts.join("");
};

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
    // Editor 1.2.0 highlights code in the state it reports, so a code block comes back as several
    // code-highlight nodes (bug log 174; steward-core accepts the type). Everything else is kept
    // exactly, and the code's text is the same.
    const { "code-highlight": returned = 0, ...kept } = countNodeTypes(document);
    const { "code-highlight": loaded = 0, ...expected } = countNodeTypes(fixture);
    expect(kept).toEqual(expected);
    expect(returned).toBeGreaterThanOrEqual(loaded);
    expect(codeText(fixture)).not.toBe("");
    expect(codeText(document)).toBe(codeText(fixture));
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

describe("StewardEditor theme", () => {
  it("draws the dark card styles in high contrast and light ones in light", async () => {
    document.documentElement.className = "hc";
    const dark = await mount();
    await waitFor(() => expect(document.querySelector(".koenig-lexical.dark")).not.toBeNull());
    dark.view.unmount();
    document.documentElement.className = "light";
    await mount();
    await waitFor(() => expect(document.querySelector(".koenig-lexical")).not.toBeNull());
    expect(document.querySelector(".koenig-lexical.dark")).toBeNull();
    document.documentElement.className = "";
  });

  it("checks spelling in US English for the default English", async () => {
    await mount();
    const box = screen.getAllByRole("textbox")[0]!;
    expect(box).toHaveAttribute("lang", "en-US");
    expect(box).not.toHaveAttribute("spellcheck", "false");
  });

  it("sets the site's tokens on the editor's box", async () => {
    await mount();
    // the package wraps the editor in layout-only boxes, so the themed box is the first ancestor
    // that carries the tokens
    const box = document
      .querySelector<HTMLElement>(".koenig-lexical")!
      .closest<HTMLElement>("[style*='--kg-accent-color']")!;
    expect(box.style.getPropertyValue("--kg-selection-color")).toBe("var(--color-primary)");
    expect(box.style.getPropertyValue("--kg-font-size")).toBe("var(--text-doc)");
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

// bug log 173: the required-sections list follows the text as it is typed. The screen keeps the
// document the editor reports and checks it on every render, so what has to hold is that each
// change is reported with the text in it.
describe("StewardEditor reports every change, for the required-sections list", () => {
  const outline: TemplateSectionOutline[] = [
    { key: "purpose", level: 2, order: 1, required: true, title: "Purpose" },
    { key: "scope", level: 2, order: 2, required: true, title: "Scope" },
  ];

  it("reports a typed section as filled, and an emptied one as missing again", async () => {
    const seen: SerializedDocument[] = [];
    await mount({
      initialDocument: scaffoldFromTemplate(outline),
      onChange: (next) => seen.push(next),
    });
    expect(missingRequiredSections(scaffoldFromTemplate(outline), outline)).toEqual([
      "Purpose",
      "Scope",
    ]);
    const editor = (
      document.querySelector("[data-lexical-editor]") as unknown as {
        __lexicalEditor: LexicalEditor;
      }
    ).__lexicalEditor;

    await act(async () => {
      editor.update(() => {
        const root = $getRoot();
        const heading = root.getChildren()[0]!;
        const body = heading.getNextSibling();
        if ($isElementNode(body)) body.selectStart();
      });
    });
    await act(async () => {
      editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, "Why this exists.");
    });
    await waitFor(() => expect(seen.length).toBeGreaterThan(0));
    expect(missingRequiredSections(seen.at(-1), outline)).toEqual(["Scope"]);

    await act(async () => {
      editor.update(() => {
        const body = $getRoot().getChildren()[0]!.getNextSibling();
        if ($isElementNode(body)) body.clear();
      });
    });
    await waitFor(() =>
      expect(missingRequiredSections(seen.at(-1), outline)).toEqual(["Purpose", "Scope"]),
    );
  });
});
