// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: MIT
// The public surface of @steward-web/editor, declared by hand. The Koenig sources under src/
// are loosely typed upstream code; consumers compile against these declarations instead of
// walking into the sources, so a strict app build never type-checks the fork.
import type { ExcludedProperties, Provider } from "@lexical/yjs";
import type {
  Klass,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  LexicalNodeReplacement,
  SerializedEditorState,
} from "lexical";
import type { FC, ReactNode, RefObject } from "react";
import type { Doc, XmlText } from "yjs";

export interface CardMenuItem {
  desc?: string;
  Icon?: FC;
  insertCommand: LexicalCommand<unknown>;
  insertParams?: Record<string, unknown>;
  label: string;
  matches?: string[];
  priority?: number;
  section?: string;
  shortcut?: string;
}

export type EditorNodes = readonly (Klass<LexicalNode> | LexicalNodeReplacement)[];

/** A file upload hook, as cards call it: `useFileUpload("image")`. */
export interface FileUploader {
  fileTypes?: Record<string, { extensions: string[]; mimeTypes: string[] }>;
  useFileUpload: (type: string) => {
    errors: { filename?: string; message: string }[];
    isLoading: boolean;
    progress: number;
    upload: (files: File[] | FileList) => Promise<{ fileName?: string; url: string }[] | null>;
  };
}

/** How the host wires collaboration: the provider for the main document and every nested
 *  editor, and where a nested editor's content lives when the transport has one room. */
export interface KoenigCollaboration {
  cursorColor?: string;
  cursorsContainerRef?: RefObject<HTMLElement | null>;
  excludedProperties?: ExcludedProperties;
  /** Resolve a nested editor's root inside the main document instead of a subdocument. */
  getNestedXmlText?: (document: Doc, id: string) => XmlText;
  providerFactory: (id: string, yjsDocumentMap: Map<string, Doc>) => Provider;
  shouldBootstrap?: boolean;
  username?: string;
}

export interface KoenigComposerProps {
  cardConfig?: Record<string, unknown>;
  children?: ReactNode;
  collaboration?: KoenigCollaboration | null;
  darkMode?: boolean;
  editable?: boolean;
  fileUploader?: Partial<FileUploader>;
  initialEditorState?: null | SerializedEditorState | string;
  nodes?: EditorNodes;
  onError?: (error: Error) => void;
}

export interface KoenigEditorAPI {
  editorInstance: LexicalEditor;
  editorIsEmpty: () => boolean;
  focusEditor: (options?: { position?: "bottom" | "top" }) => void;
  serialize: () => string;
}

export interface KoenigEditorProps {
  children?: ReactNode;
  className?: string;
  dataTestId?: string;
  hiddenFormats?: string[];
  isDragEnabled?: boolean;
  isSnippetsEnabled?: boolean;
  onBlur?: () => void;
  onChange?: (json: SerializedEditorState) => void;
  onFocus?: () => void;
  placeholderClassName?: string;
  placeholderText?: string;
  readOnly?: boolean;
  registerAPI?: (api: KoenigEditorAPI) => void;
}

export declare const KoenigComposer: FC<KoenigComposerProps>;
export declare const KoenigEditor: FC<KoenigEditorProps>;
export declare const KoenigComposableEditor: FC<KoenigEditorProps>;
export declare const AllDefaultPlugins: FC;
export declare const TablePlugin: FC;
export declare const TABLE_MENU_ITEM: CardMenuItem;

/** The node set the editor registers: Koenig's kept cards plus the stock Lexical nodes. */
export declare const DEFAULT_NODES: EditorNodes;
export declare const BASIC_NODES: EditorNodes;
export declare const MINIMAL_NODES: EditorNodes;

export { type EditorState } from "lexical";
