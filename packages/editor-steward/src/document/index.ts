// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The stored draft format and the template-section helpers, as plain data: no Lexical, no
// React, safe for the server and the mock gateway.
export {
  applySectionText,
  ensureTemplateSections,
  extractSections,
  fillEmptySections,
  missingRequiredSections,
  paragraphsFromText,
  scaffoldFromTemplate,
  type SectionText,
  type TemplateSectionOutline,
} from "./sections";
export {
  countNodeTypes,
  emptyParagraph,
  hasText,
  nodeText,
  parseDocument,
  type SerializedDocument,
  type SerializedNode,
  serializeDocument,
  wrapRoot,
} from "./tree";
