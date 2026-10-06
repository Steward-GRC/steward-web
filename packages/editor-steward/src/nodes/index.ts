// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DEFAULT_NODES } from "@steward-web/editor";
import { createElement } from "react";

import { nodeText, type SerializedNode } from "../document/tree";
import { passthroughNode } from "./passthroughNode";

const bodyText = (body: unknown): string => {
  const content = (body as { content?: unknown } | undefined)?.content;
  return Array.isArray(content)
    ? content.map((node) => nodeText(node as SerializedNode)).join("")
    : "";
};

/** A footnote marker from the original editor: `{footnoteId, body}`. */
export const footnote = passthroughNode({
  inline: true,
  render: (json) =>
    createElement("sup", { className: "text-muted", title: bodyText(json.body) || undefined }, "†"),
  type: "footnote",
});

/** A mention chip from the original editor: `{id, label}`. */
export const mention = passthroughNode({
  inline: true,
  render: (json) =>
    createElement(
      "span",
      { className: "rounded bg-sunken px-1 text-sm font-medium" },
      `@${String(json.label ?? "")}`,
    ),
  type: "mention",
});

/** An embedded widget from the original editor: `{embedId, props, fallback?}`. */
export const embed = passthroughNode({
  inline: false,
  render: (json) =>
    createElement(
      "div",
      { className: "rounded-md border border-border p-3 text-sm text-muted" },
      String(json.fallback ?? json.embedId ?? ""),
    ),
  type: "embed",
});

/** Steward's own nodes, registered beside the editor's. */
export const STEWARD_NODES = [footnote.Node, mention.Node, embed.Node] as const;

/** Everything a Steward document can hold. */
export const stewardEditorNodes = [...DEFAULT_NODES, ...STEWARD_NODES];
