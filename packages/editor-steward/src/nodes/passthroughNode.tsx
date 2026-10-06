// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from "react";

import {
  DecoratorNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";

/** The serialized JSON of a node this editor carries without editing it. */
export type PassthroughJSON = Record<string, unknown> & SerializedLexicalNode;

interface PassthroughSpec {
  /** Inline nodes sit inside a paragraph; block nodes sit at the root. */
  inline: boolean;
  /** How the node reads in the editor. Display only; the JSON is never touched. */
  render: (json: PassthroughJSON) => ReactNode;
  /** The original editor's node type name, kept so older documents load unchanged. */
  type: string;
}

/**
 * Build a decorator node class for a node type the original editor wrote that this editor
 * has no card for (footnotes, mentions, embeds). It keeps the node's serialized JSON exactly
 * as stored and writes it back unchanged, so a document carrying one loads, edits around it
 * and saves without losing it.
 */
export const passthroughNode = ({ inline, render, type }: PassthroughSpec) => {
  class PassthroughNode extends DecoratorNode<ReactNode> {
    __json: PassthroughJSON;

    constructor(json: PassthroughJSON, key?: NodeKey) {
      super(key);
      this.__json = json;
    }

    static override clone(node: PassthroughNode): PassthroughNode {
      return new PassthroughNode(node.__json, node.__key);
    }

    static override getType(): string {
      return type;
    }

    static override importJSON(json: PassthroughJSON): PassthroughNode {
      return new PassthroughNode(json);
    }

    override createDOM(): HTMLElement {
      const element = document.createElement(inline ? "span" : "div");
      element.dataset.stewardNode = type;
      return element;
    }

    override decorate(): ReactNode {
      return render(this.__json);
    }

    override exportDOM(): DOMExportOutput {
      const element = document.createElement(inline ? "span" : "div");
      element.dataset.stewardNode = type;
      return { element };
    }

    override exportJSON(): PassthroughJSON {
      return { ...this.__json, type, version: this.__json.version };
    }

    override isInline(): boolean {
      return inline;
    }

    override updateDOM(): false {
      return false;
    }
  }

  return {
    $is: (node: LexicalNode | null | undefined): node is PassthroughNode =>
      node instanceof PassthroughNode,
    Node: PassthroughNode,
  };
};
