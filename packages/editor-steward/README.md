# @steward-web/editor-steward

Steward's adapter for `@steward-web/editor`: everything Steward-specific about the editor, kept
out of the editor package so that one stays a plain fork.

- `@steward-web/editor-steward/document`: the stored draft format and the template-section
  helpers, as plain data (no Lexical, no React). The server, the mock gateway and the gates use
  it.
- `@steward-web/editor-steward`: the above, the server-rendered read-only view
  (`LexicalDocumentView`) and the collab wiring (`createStewardCollaboration`).
- `@steward-web/editor-steward/client`: `StewardEditor`, browser only. Load it lazily behind a
  client boundary and render `LexicalDocumentView` until it arrives.

## The stored format

A draft's `contentJson` is the Lexical serialized editor state: `{"root": {"type": "root",
"children": [...]}}` with at least one child, each child carrying a non-empty `type`. That is
the shape steward-core's validator checks. A template section is a `heading` whose text is the
section title, followed by its body up to the next heading at the same or a higher level;
deeper headings belong to the section.

`parseDocument` refuses anything else (the earlier plain-text section array included) and gives
an empty root one empty paragraph. `missingRequiredSections` is the publish gate: a required
section with no heading, or no text under its heading, is unfilled.

## Steward's nodes

The older editor wrote three node types the editor has no card for: `footnote`, `mention` and
`embed`. They load as pass-through nodes that keep their JSON exactly as stored and write it
back unchanged, so a document carrying one edits and saves without losing it.

## Collaboration

`createStewardCollaboration(doc, awareness)` puts the editor on the draft's one collab room:

- every Yjs provider the editor asks for forwards the session's socket once `attach` is called,
  and never opens or closes it;
- nested editors (captions, callout and toggle text) keep their content in a named top-level
  `XmlText` of the room's document, since the relay carries one document per draft;
- remote carets take the name and colour the relay binds into each awareness state.

## Tests

- An original-shape document (`src/__fixtures__/originalDocument.json`, written by stock Lexical
  0.45 plus the older editor's own nodes) loads, edits and re-serializes without loss, headless
  and mounted.
- The editor package never imports this one or any other workspace package
  (`src/coreIsolation.test.ts`), and its declared surface exists at runtime.
