// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import "@steward-web/editor/styles.css";
import {
  type FileUploader,
  KoenigComposer,
  KoenigEditor,
  type KoenigEditorAPI,
} from "@steward-web/editor";
import { useTranslation } from "@steward-web/i18n";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { StewardCollaboration } from "./collab/stewardCollaboration";

import { parseDocument, type SerializedDocument, serializeDocument } from "./document/tree";
import { stewardEditorNodes } from "./nodes";

/** What a host can do with a mounted editor. */
export interface StewardEditorHandle {
  /** The document as it stands now. */
  getDocument: () => SerializedDocument;
  /** Replace the whole document. In a collaborative session the change syncs to every peer. */
  setDocument: (document: SerializedDocument) => void;
}

export interface StewardEditorProps {
  className?: string;
  /** The room to edit in, or null to edit alone. Fixed for the life of the mount. */
  collaboration?: null | StewardCollaboration;
  /** The stored document. Seeds a collaborative room only when the room is still empty. */
  initialDocument?: SerializedDocument;
  onChange?: (document: SerializedDocument) => void;
  onReady?: (handle: StewardEditorHandle) => void;
  placeholder?: string;
  readOnly?: boolean;
  /** Stores an image and answers its URL. Without one the image card says uploads are off. */
  uploadImage?: (file: File) => Promise<string>;
}

// Steward's theme for the editor: its accent follows the UI kit's primary colour, and its dark
// styles follow the `dark` class the kit puts on the document. The box is the positioning
// context remote carets are drawn against.
const EDITOR_THEME = {
  "--kg-accent-color": "var(--color-primary)",
  position: "relative",
} as CSSProperties;

const IMAGE_TYPES = {
  image: {
    extensions: ["gif", "jpg", "jpeg", "png", "svg", "webp"],
    mimeTypes: ["image/gif", "image/jpeg", "image/png", "image/svg+xml", "image/webp"],
  },
};

const useImageUploader = (
  uploadImage: StewardEditorProps["uploadImage"],
  unavailable: string,
): FileUploader["useFileUpload"] =>
  // A hook factory the cards call as `useFileUpload("image")`; its identity is stable per
  // upload function so the cards' effects don't re-run on every render.
  useMemo(
    () =>
      function useFileUpload() {
        const [state, setState] = useState<{
          errors: { message: string }[];
          isLoading: boolean;
          progress: number;
        }>({ errors: [], isLoading: false, progress: 0 });
        const upload = useCallback(async (files: File[] | FileList) => {
          const list = [...files];
          if (!uploadImage) {
            setState({ errors: [{ message: unavailable }], isLoading: false, progress: 0 });
            return null;
          }
          setState({ errors: [], isLoading: true, progress: 0 });
          try {
            const urls = await Promise.all(list.map((file) => uploadImage(file)));
            setState({ errors: [], isLoading: false, progress: 100 });
            return urls.map((url, index) => ({ fileName: list[index]?.name, url }));
          } catch (error) {
            const message = error instanceof Error ? error.message : unavailable;
            setState({ errors: [{ message }], isLoading: false, progress: 0 });
            return null;
          }
        }, []);
        return { ...state, upload };
      },
    [uploadImage, unavailable],
  );

/**
 * Steward's editor: the Koenig editor with Steward's nodes, Steward's collab room and
 * Steward's wording. Browser only; render it behind a client boundary and show
 * `LexicalDocumentView` until it loads.
 */
export const StewardEditor = ({
  className,
  collaboration = null,
  initialDocument,
  onChange,
  onReady,
  placeholder,
  readOnly = false,
  uploadImage,
}: StewardEditorProps) => {
  const { t } = useTranslation("authoring");
  const apiRef = useRef<KoenigEditorAPI | null>(null);
  const cursorsContainerRef = useRef<HTMLDivElement | null>(null);
  const useFileUpload = useImageUploader(uploadImage, t("editor.imageUploadUnavailable"));
  const fileUploader = useMemo(() => ({ fileTypes: IMAGE_TYPES, useFileUpload }), [useFileUpload]);
  // Fixed at mount: the composer reads its initial state and collaboration mode once.
  const [initialEditorState] = useState(() =>
    initialDocument ? serializeDocument(initialDocument) : undefined,
  );
  const koenigCollaboration = useMemo(
    () => (collaboration ? { ...collaboration.koenig, cursorsContainerRef } : null),
    [collaboration],
  );

  const registerAPI = useCallback(
    (api: KoenigEditorAPI) => {
      apiRef.current = api;
      onReady?.({
        getDocument: () => api.editorInstance.getEditorState().toJSON() as SerializedDocument,
        setDocument: (document) => {
          const editor = api.editorInstance;
          editor.setEditorState(editor.parseEditorState(serializeDocument(document)));
        },
      });
    },
    [onReady],
  );

  useEffect(() => {
    apiRef.current?.editorInstance.setEditable(!readOnly);
  }, [readOnly]);

  const handleChange = useCallback(
    (json: unknown) => {
      const document = parseDocument(JSON.stringify(json));
      if (document) onChange?.(document);
    },
    [onChange],
  );

  return (
    <div className={className} ref={cursorsContainerRef} style={EDITOR_THEME}>
      <KoenigComposer
        collaboration={koenigCollaboration}
        editable={!readOnly}
        fileUploader={fileUploader}
        initialEditorState={initialEditorState}
        nodes={stewardEditorNodes}
      >
        <KoenigEditor
          onChange={handleChange}
          placeholderText={placeholder ?? t("editor.placeholder")}
          readOnly={readOnly}
          registerAPI={registerAPI}
        />
      </KoenigComposer>
    </div>
  );
};
