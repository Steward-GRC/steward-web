// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import "@steward-web/editor/styles.css";
import { createElement, type ReactNode } from "react";

import type { SerializedDocument, SerializedNode } from "./document/tree";

// The read-only view of a stored document, built from the JSON with plain React so it renders
// on the server. The editor itself needs a browser; routes render this first and swap the
// editor in once it loads. It shows content and never runs stored HTML.

const FORMAT = {
  bold: 1,
  code: 16,
  highlight: 128,
  italic: 2,
  strikethrough: 4,
  subscript: 32,
  superscript: 64,
  underline: 8,
} as const;

const SAFE_HREF = /^(?:https?:|mailto:|\/|#)/i;

const stripTags = (html: unknown): string =>
  typeof html === "string"
    ? html
        .replaceAll(/<[^>]*>/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim()
    : "";

const renderText = (node: SerializedNode, key: number): ReactNode => {
  const format = typeof node.format === "number" ? node.format : 0;
  let content: ReactNode = String(node.text ?? "");
  if (format & FORMAT.code) content = <code>{content}</code>;
  if (format & FORMAT.bold) content = <strong>{content}</strong>;
  if (format & FORMAT.italic) content = <em>{content}</em>;
  if (format & FORMAT.underline) content = <u>{content}</u>;
  if (format & FORMAT.strikethrough) content = <s>{content}</s>;
  if (format & FORMAT.subscript) content = <sub>{content}</sub>;
  if (format & FORMAT.superscript) content = <sup>{content}</sup>;
  if (format & FORMAT.highlight) content = <mark>{content}</mark>;
  return <span key={key}>{content}</span>;
};

const renderChildren = (node: SerializedNode): ReactNode[] =>
  (node.children ?? []).map((child, index) => renderNode(child, index));

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const renderNode = (node: SerializedNode, key: number): ReactNode => {
  switch (node.type) {
    case "aside": {
      return <aside key={key}>{renderChildren(node)}</aside>;
    }
    case "autolink":
    case "link": {
      const href = typeof node.url === "string" && SAFE_HREF.test(node.url) ? node.url : undefined;
      return (
        <a href={href} key={key} rel="noreferrer">
          {renderChildren(node)}
        </a>
      );
    }
    case "callout": {
      return (
        <div className="kg-callout-card" key={key}>
          {typeof node.calloutEmoji === "string" ? <span>{node.calloutEmoji} </span> : null}
          {stripTags(node.calloutText)}
        </div>
      );
    }
    case "code": {
      return (
        <pre key={key}>
          <code>{(node.children ?? []).map((child) => String(child.text ?? "")).join("")}</code>
        </pre>
      );
    }
    case "code-highlight":
    case "text": {
      return renderText(node, key);
    }
    case "embed": {
      return <div key={key}>{String(node.fallback ?? "")}</div>;
    }
    case "footnote": {
      return <sup key={key}>{"†"}</sup>;
    }
    case "heading": {
      const tag = typeof node.tag === "string" && HEADING_TAGS.has(node.tag) ? node.tag : "h2";
      return createElement(tag, { key }, renderChildren(node));
    }
    case "horizontalrule": {
      return <hr key={key} />;
    }
    case "image": {
      const source = typeof node.src === "string" && SAFE_HREF.test(node.src) ? node.src : "";
      const caption = stripTags(node.caption);
      return (
        <figure key={key}>
          {source ? (
            <img
              alt={String(node.alt ?? "")}
              height={typeof node.height === "number" ? node.height : undefined}
              src={source}
              width={typeof node.width === "number" ? node.width : undefined}
            />
          ) : null}
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }
    case "linebreak": {
      return <br key={key} />;
    }
    case "list": {
      const tag = node.listType === "number" ? "ol" : "ul";
      return createElement(tag, { key }, renderChildren(node));
    }
    case "listitem": {
      const marker = node.checked === true ? "[x] " : node.checked === false ? "[ ] " : null;
      return (
        <li key={key}>
          {marker}
          {renderChildren(node)}
        </li>
      );
    }
    case "mention": {
      return <span key={key}>@{String(node.label ?? "")}</span>;
    }
    case "paragraph": {
      return <p key={key}>{renderChildren(node)}</p>;
    }
    case "quote": {
      return <blockquote key={key}>{renderChildren(node)}</blockquote>;
    }
    case "tab": {
      return <span key={key}>{"\t"}</span>;
    }
    case "table": {
      return (
        <table key={key}>
          <tbody>{renderChildren(node)}</tbody>
        </table>
      );
    }
    case "tablecell": {
      const props = {
        colSpan: typeof node.colSpan === "number" ? node.colSpan : undefined,
        key,
        rowSpan: typeof node.rowSpan === "number" ? node.rowSpan : undefined,
      };
      return createElement(
        typeof node.headerState === "number" && node.headerState > 0 ? "th" : "td",
        props,
        renderChildren(node),
      );
    }
    case "tablerow": {
      return <tr key={key}>{renderChildren(node)}</tr>;
    }
    case "toggle": {
      return (
        <details key={key}>
          <summary>{stripTags(node.heading)}</summary>
          {stripTags(node.content)}
        </details>
      );
    }
    default: {
      return node.children ? <div key={key}>{renderChildren(node)}</div> : null;
    }
  }
};

export interface LexicalDocumentViewProps {
  className?: string;
  document?: SerializedDocument;
}

/** A stored document, read-only, in the editor's content styles. */
export const LexicalDocumentView = ({ className, document }: LexicalDocumentViewProps) => (
  <div className={`koenig-lexical ${className ?? ""}`.trim()} data-testid="document-view">
    <div className="kg-prose">{document ? renderChildren(document.root) : null}</div>
  </div>
);
