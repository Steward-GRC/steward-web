# The authoring editor

Staff write policies and procedures in a rich-text editor: a build of Ghost's Koenig editor on
Lexical (`packages/editor`), with Steward's wiring in `packages/editor-steward`. This page covers
how the staff draft page uses it.

## What the author gets

- Content styles for headings, quotes, bulleted and numbered lists, links, code
  blocks and tables.
- A "+" button on an empty line and a `/` slash menu for blocks: image, callout, toggle,
  divider and table.
- A floating toolbar on selected text (bold, italic, headings, quote, link).
- Cards that select, move by drag and edit in place.
- Remote carets with each collaborator's name and colour while co-editing.

## The draft format

`PolicyVersion.contentJson` holds the Lexical serialized editor state. A template section is a
heading carrying the section's title, followed by its body; a new template draft opens with each
section's heading and an empty paragraph, in template order, and a draft missing a section gets
it added back when it opens. A freeform draft has no headings to keep.

Publishing is blocked while a required template section has no text under its heading. The page
shows the same check the gateway makes, before the round trip.

Anything in `contentJson` that isn't an editor state (the plain-text section array the first
version of this page wrote) is not loaded: the draft opens from its template's scaffold.

## Rendering

The editor needs a browser. The server renders the stored document read-only, and the editor's
code loads after hydration and takes over, so the page still renders on the server.

## Co-editing

The page asks the gateway for a collab token (`issueCollabToken`) and joins the draft's room
through the gateway's websocket proxy. It waits up to four seconds for the room:

- If the room answers, the editor mounts in it. The room's document is the source of truth; the
  first browser in an empty room seeds it from the stored draft. Edits are checkpointed to
  steward-core about five seconds after typing stops, and again on leaving the page.
- If there is no token, no relay, or no answer in time, the editor mounts alone and the Save
  button stores the draft.

A room that drops mid-session keeps its editor; Save still works. When the draft is published
elsewhere the editor turns read-only.

## The new-policy form

The form's in-progress values are kept in `localStorage` under
`steward-web:staff:new-policy-draft:v2`. A value left under the earlier key is dropped, never
read back.

## AI features

Review, generation and assist read the draft's sections as plain text (a table keeps its rows
and columns, a list one item per line). Generated text fills only sections that are still empty;
an assist suggestion replaces the body of the one section it was asked about. A freeform draft
is one "Content" section.
