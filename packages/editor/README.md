# @steward-web/editor

A build of Ghost's Koenig editor (MIT), unbundled onto the workspace's own Lexical 0.52, React
19 and Yjs, with Lexical's stock table nodes added. It knows nothing about Steward: Steward's
collab wiring, its own nodes, wording and theme live in `@steward-web/editor-steward`, which
this package never imports.

## Upstream

- Source: `TryGhost/Koenig`, commit `4da831801b9ca065e4b30abe96c8b33227133e6c` (2026-07-13).
- `src/koenig-lexical/` is that commit's `packages/koenig-lexical/src` (koenig-lexical 1.8.3).
- `src/kg-default-nodes/` is `packages/kg-default-nodes/src` (2.1.3) and
  `src/kg-default-transforms/` is `packages/kg-default-transforms/src`: the node classes and
  transforms the editor builds on, brought in so they use the same Lexical.
- `LICENSE` is upstream's MIT licence, unchanged. Upstream files keep upstream's code style and
  carry no per-file headers; files written for this build (`src/additions/`, `src/index.ts`,
  `index.d.ts`, `scripts/`, `types/`) say MIT in their SPDX line.

To carry a later upstream fix over, diff the same paths between the commit above and the newer
one, apply the change by hand, and update the commit here. Upstream history is not imported.

## What changed from upstream

- Lexical, `@lexical/*`, Yjs and React are peer dependencies at the workspace's versions
  instead of being bundled. Lexical 0.13 to 0.52 changes are fixed in place (for example
  `$canShowPlaceholder` lost its second argument, `CollaborationPlugin` now needs a
  `LexicalCollaboration` provider, and every registered node class declares its own
  `getType`, `clone` and `importJSON`).
- Stock node type names are kept: `text`, `heading`, `quote` and the rest save under their stock
  names (upstream swaps in `extended-*` replacements), so documents stay readable by any plain
  Lexical consumer, older documents included. Code blocks are stock `code` nodes.
- Tables: `@lexical/table`'s `table`, `tablerow` and `tablecell` are registered, with Lexical's
  table plugin and a Table entry in the "+" and slash menus (`src/additions/table/`).
- Collaboration: the composer takes a `collaboration` prop (a Yjs provider factory, and
  optionally where a nested editor's content lives in the main document) instead of opening
  its own websocket. The host owns the transport.
- Markdown paste converts with `@lexical/markdown` rather than upstream's Markdown renderer.
- The card menu's links to upstream's help pages are gone, and links to outside sites in
  comments are written as plain references.
- Emoji in the sources are written as escapes (the callout's default icon) or dropped from
  copy and comments.
- Kept: the content styles, the "+" and slash card menus, the floating format and link
  toolbars, card selection, drag to reorder, remote carets, and the image, callout, toggle,
  divider and aside cards.
- Removed: cards that need a Ghost site or service (membership, signup, product, paywall,
  email and email CTA, call to action, button, header, bookmark, embed, audio, video, file,
  gallery, HTML, Markdown, Transistor, Ghost's code block card), the GIF and Unsplash pickers,
  the Pintura image editor, the emoji picker (it needs emoji-mart), the TK and at-link nodes,
  word counts, replacement strings, the demo, stories and upstream's tests.
- Images: an image the older editor kept inside a paragraph loads as an image card placed after
  that paragraph, because cards sit at the top level. Its `src`, `alt`, `width` and `height`
  are kept.

## Use

```tsx
import "@steward-web/editor/styles.css";
import { DEFAULT_NODES, KoenigComposer, KoenigEditor } from "@steward-web/editor";

<KoenigComposer initialEditorState={json} nodes={DEFAULT_NODES} fileUploader={uploader}>
  <KoenigEditor onChange={(state) => save(state)} />
</KoenigComposer>;
```

Consumers type-check against the hand-written `index.d.ts`, not the sources (upstream's sources
are loosely typed). `@steward-web/editor-steward`'s tests check that every value declared there
exists at runtime.

## Styles

The sources are written for Tailwind 3 with their own theme, scoped under `.koenig-lexical`.
`src/generated/koenig.css` is that build, committed so the apps' Tailwind 4 never reads these
classes. Rebuild it after changing a class name:

```bash
corepack pnpm --filter @steward-web/editor build:css
```

## Checks

- The core may not import any `@steward-web/*` package or a file outside this folder. ESLint's
  `no-restricted-imports` and a test in `@steward-web/editor-steward` both enforce it.
- The shared lint rules skip upstream's folders (their style is upstream's); `src/additions` is
  linted as usual. `pnpm --filter @steward-web/editor typecheck` checks the declarations and the
  additions.
- The Apache-2.0 header check (golic) skips this package: it is MIT-licensed.
