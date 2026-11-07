// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import "node-koenig-editor/styles.css";
import { useLocale, useTranslation } from "@steward-web/i18n";
import {
  type FileUploader,
  KoenigComposer,
  KoenigEditor,
  type KoenigEditorAPI,
  useKoenigWordCount,
} from "node-koenig-editor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { StewardCollaboration } from "./collab/stewardCollaboration";

import {
  createAiToolbarAction,
  replaceSavedSelection,
  type ReworkRequest,
  type SavedReplace,
} from "./AiToolbarAction";
import { stripMarks } from "./document/marks";
import { parseDocument, type SerializedDocument, serializeDocument } from "./document/tree";
import {
  BASE_CARDS,
  BASE_COLORS,
  BASE_TOOLS,
  FILE_ICONS,
  FILE_UPLOAD_RULE,
  reduceToolbar,
  type StewardToolbarItem,
} from "./editorConfig";
import { describeEditorError } from "./editorErrors";
import { EDITOR_THEME, isDarkTheme } from "./editorTheme";
import { STEWARD_NODES } from "./nodes";
import {
  createCommentToolbarAction,
  type ReviewComments,
  ReviewThreadAnchors,
  ReviewThreadsPanel,
} from "./ReviewComments";
import { ImageUploadError } from "./uploadImage";

/** What a host can do with a mounted editor. */
export interface StewardEditorHandle {
  /** The document as it stands now. */
  getDocument: () => SerializedDocument;
  /**
   * Put `text` in place of the selection last sent to `onRework`. False when there's none, or
   * when that text has gone since. In a collaborative session the change syncs to every peer.
   */
  replaceSelection: (text: string) => boolean;
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
  /**
   * Called with one short line (no stack, no document text) when the editor catches an error,
   * a card that failed to show included. It is logged either way; this is for the dev report.
   */
  onError?: (summary: string) => void;
  onReady?: (handle: StewardEditorHandle) => void;
  /**
   * Adds "Rework selected text with AI" to the selection toolbar, with Rewrite and Clarify, and
   * is called with the choice and the selected text. Without it there's no button.
   */
  onRework?: (request: ReworkRequest) => void;
  placeholder?: string;
  readOnly?: boolean;
  /**
   * Inline review comments: the service's threads are highlighted on their text and listed
   * beside the document, with reply and resolve. `onAdd` adds a Comment button to the selection
   * toolbar. The highlights are never part of the stored document.
   */
  review?: ReviewComments;
  /** Reduce Steward's base format buttons for this editor. It can only take buttons away. */
  toolbar?: readonly StewardToolbarItem[];
  /** Stores an image and answers its URL. Without one the image card says uploads are off. */
  uploadImage?: (file: File) => Promise<string>;
}

// What the cards offer to upload: the file card's attachments and the image card's images. SVG is
// refused: served inline it is a stored-XSS vector.
const UPLOAD_TYPES = {
  file: {
    ...FILE_UPLOAD_RULE,
    extensions: [...FILE_UPLOAD_RULE.extensions],
    mimeTypes: [...FILE_UPLOAD_RULE.mimeTypes],
  },
  image: {
    extensions: ["gif", "jpg", "jpeg", "png", "webp"],
    mimeTypes: ["image/gif", "image/jpeg", "image/png", "image/webp"],
  },
};

const useImageUploader = (
  uploadImage: StewardEditorProps["uploadImage"],
  unavailable: string,
  failed: string,
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
            // The gateway's own refusal (too large, not an allowed image) when it gave one.
            const message =
              error instanceof ImageUploadError ? (error.gatewayText ?? failed) : failed;
            setState({ errors: [{ message }], isLoading: false, progress: 0 });
            return null;
          }
        }, []);
        return { ...state, upload };
      },
    [uploadImage, unavailable, failed],
  );

const prefersDark = () => globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

/** Whether the page is in a dark theme: the `dark`/`hc` class, or System with a dark OS. */
const readDark = () => isDarkTheme(globalThis.document.documentElement.classList, prefersDark());

const useDarkTheme = (): boolean => {
  const [dark, setDark] = useState(readDark);
  useEffect(() => {
    const update = () => setDark(readDark());
    const observer = new MutationObserver(update);
    observer.observe(globalThis.document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", update);
    };
  }, []);
  return dark;
};

/**
 * Steward's editor: the Koenig editor with Steward's nodes, Steward's collab room and
 * Steward's wording. Browser only; render it behind a client boundary and show
 * `LexicalDocumentView` until it loads.
 */
/** The words and the reading time of what is being written, live (bug log 172). */
const EditorWordCount = () => {
  const { readingTimeLabel, wordsLabel } = useKoenigWordCount();
  return (
    <p className="mt-4 flex gap-2 text-sm text-muted" data-word-count="">
      <span>{wordsLabel}</span>
      <span aria-hidden="true">·</span>
      <span>{readingTimeLabel}</span>
    </p>
  );
};

export const StewardEditor = ({
  className,
  collaboration = null,
  initialDocument,
  onChange,
  onError,
  onReady,
  onRework,
  placeholder,
  readOnly = false,
  review,
  toolbar,
  uploadImage,
}: StewardEditorProps) => {
  const { t } = useTranslation("authoring");
  // The browser checks spelling in this language. The default English is the bare `en` tag, which
  // a browser may check against any English; the app's spelling is US English ("organization").
  const { locale } = useLocale();
  const lang = locale === "en" ? "en-US" : locale;
  const apiRef = useRef<KoenigEditorAPI | null>(null);
  const cursorsContainerRef = useRef<HTMLDivElement | null>(null);
  const savedSelection: SavedReplace = useRef(null);
  const useFileUpload = useImageUploader(
    uploadImage,
    t("editor.imageUploadUnavailable"),
    t("editor.imageUploadFailed"),
  );
  const fileUploader = useMemo(() => ({ fileTypes: UPLOAD_TYPES, useFileUpload }), [useFileUpload]);
  // Fixed at mount: the composer reads its initial state and collaboration mode once.
  const [initialEditorState] = useState(() =>
    initialDocument ? serializeDocument(initialDocument) : undefined,
  );
  const toolbarActions = useMemo(
    () => [
      createCommentToolbarAction(t("editor.comments.button"), review?.onAdd),
      createAiToolbarAction({
        hidden: !onRework || readOnly,
        labels: {
          button: t("editor.rework.button"),
          clarify: t("editor.rework.clarify"),
          rewrite: t("editor.rework.rewrite"),
        },
        onRework: (request) => onRework?.(request),
        saved: savedSelection,
      }),
    ],
    [onRework, readOnly, review?.onAdd, t],
  );
  // The package keeps the threads' state (resolved, active) to style the highlights; the
  // service's threads are the source.
  const commentThreads = useMemo(
    () =>
      review
        ? {
            threads: review.threads.map((thread) => ({
              createdAt: thread.createdAt,
              id: thread.id,
              messages: thread.messages.map((message) => ({
                author: message.authorName ?? message.authorUserId,
                body: message.body,
                createdAt: message.createdAt,
                id: message.id,
              })),
              quote: thread.quote,
              resolved: thread.resolved,
            })),
          }
        : undefined,
    [review],
  );
  const strings = useMemo(
    () => ({
      errorFallback: t("editor.cardError"),
      wordCount: {
        readLessThanMinute: t("editor.wordCount.readLessThanMinute"),
        readMinutes: t("editor.wordCount.readMinutes"),
        word: t("editor.wordCount.word"),
        words: t("editor.wordCount.words"),
      },
    }),
    [t],
  );
  const dark = useDarkTheme();
  const handleError = useCallback(
    (error: Error) => {
      const summary = describeEditorError(error);
      console.error(`[editor] ${summary}`);
      onError?.(summary);
    },
    [onError],
  );
  const koenigCollaboration = useMemo(
    () => (collaboration ? { ...collaboration.koenig, cursorsContainerRef } : null),
    [collaboration],
  );

  const registerAPI = useCallback(
    (api: KoenigEditorAPI) => {
      apiRef.current = api;
      onReady?.({
        getDocument: () =>
          stripMarks(api.editorInstance.getEditorState().toJSON() as SerializedDocument),
        replaceSelection: (text) => replaceSavedSelection(savedSelection, text),
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
      if (document) onChange?.(stripMarks(document));
    },
    [onChange],
  );

  const editor = (
    <>
      <KoenigEditor
        onChange={handleChange}
        placeholderText={placeholder ?? t("editor.placeholder")}
        readOnly={readOnly}
        registerAPI={registerAPI}
      />
      <EditorWordCount />
    </>
  );

  return (
    <div className={className} ref={cursorsContainerRef} style={EDITOR_THEME}>
      <KoenigComposer
        cards={[...BASE_CARDS]}
        collaboration={koenigCollaboration}
        colors={BASE_COLORS}
        comments={commentThreads}
        customNodes={STEWARD_NODES}
        darkMode={dark}
        editable={!readOnly}
        fileIcons={FILE_ICONS}
        fileUploader={fileUploader}
        initialEditorState={initialEditorState}
        lang={lang}
        onError={handleError}
        strings={strings}
        toolbar={review && readOnly ? [] : reduceToolbar(toolbar)}
        toolbarActions={toolbarActions}
        tools={[...BASE_TOOLS]}
      >
        {review && (review.threads.length > 0 || review.onAdd) ? (
          <div className="flex flex-col items-start gap-6 lg:flex-row">
            <div className="min-w-0 flex-1 self-stretch">{editor}</div>
            <ReviewThreadAnchors threads={review.threads} />
            <ReviewThreadsPanel comments={review} />
          </div>
        ) : (
          editor
        )}
      </KoenigComposer>
    </div>
  );
};
