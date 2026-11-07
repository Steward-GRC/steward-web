// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The stored draft format and the template-section helpers, as plain data: no Lexical, no
// React, safe for the server and the mock gateway.
export { sameContent } from "./comparable";
export {
  applySectionText,
  ensureTemplateSections,
  extractSections,
  fillEmptySections,
  insertSectionAfter,
  missingRequiredSections,
  paragraphsFromText,
  resetRequiredSections,
  scaffoldFromTemplate,
  type SectionText,
  type TemplateSectionOutline,
} from "./sections";
export {
  countNodeTypes,
  documentText,
  emptyParagraph,
  hasText,
  nodeText,
  parseDocument,
  type SerializedDocument,
  type SerializedNode,
  serializeDocument,
  wrapRoot,
} from "./tree";
