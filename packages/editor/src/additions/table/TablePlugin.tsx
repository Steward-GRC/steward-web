import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: MIT
import { TablePlugin as LexicalTablePlugin } from "@lexical/react/LexicalTablePlugin";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

// Mounts Lexical's own table behaviour (cell selection, tab navigation, the insert command)
// when the editor registers the table nodes. Nested editors that leave them out render nothing.
export const TablePlugin = () => {
  const [editor] = useLexicalComposerContext();
  if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
    return null;
  }
  return (
    <LexicalTablePlugin hasCellBackgroundColor={true} hasCellMerge={true} hasTabHandler={true} />
  );
};

export default TablePlugin;
