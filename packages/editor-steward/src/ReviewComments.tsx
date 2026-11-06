import { $isMarkNode, MarkNode } from "@lexical/mark";
// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Inline review comments (bug log 42). An approver selects text in the version under review and
// comments on it; the drafter sees the thread on the highlighted text, replies and resolves.
// The service keeps each thread (its quote, which match of it, its messages); the editor draws
// the highlight, which this puts back each time the document opens (`ReviewThreadAnchors`).
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useTranslation } from "@steward-web/i18n";
import { $nodesOfType } from "lexical";
import {
  type KoenigToolbarAction,
  type KoenigToolbarSelection,
  useKoenigComments,
} from "node-koenig-editor";
import { type FC, type FormEvent, useEffect, useState } from "react";

import { $anchorThread, $selectionAnchor, type TextAnchor } from "./reviewAnchors";

/** What a host passes to show and change review threads in the editor. */
export interface ReviewComments {
  /** The signed-in person, so their own threads can be deleted. */
  meId: string;
  /** Starts a thread on the selection. Without it there's no Comment button. */
  onAdd?: (draft: { body: string } & TextAnchor) => Promise<void> | void;
  onDelete?: (threadId: string) => Promise<void> | void;
  onReply: (threadId: string, body: string) => Promise<void> | void;
  onResolve: (threadId: string, resolved: boolean) => Promise<void> | void;
  threads: readonly ReviewThreadView[];
}

export interface ReviewThreadMessage {
  authorName: null | string;
  authorUserId: string;
  body: string;
  createdAt: string;
  id: string;
}

export interface ReviewThreadView extends TextAnchor {
  createdAt: string;
  id: string;
  messages: readonly ReviewThreadMessage[];
  resolved: boolean;
}

/** Highlights each thread's text. Retries on every update, so a document that arrives late
 *  (a collaborative room syncing) still gets them. */
export const ReviewThreadAnchors: FC<{ threads: readonly ReviewThreadView[] }> = ({ threads }) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const anchorAll = () => {
      editor.update(
        () => {
          const have = new Set(
            $nodesOfType(MarkNode)
              .filter((node) => $isMarkNode(node))
              .flatMap((node) => node.getIDs()),
          );
          for (const thread of threads) {
            if (!have.has(thread.id)) $anchorThread(thread.id, thread);
          }
        },
        { tag: "history-merge" },
      );
    };
    anchorAll();
    return editor.registerUpdateListener(({ dirtyElements, tags }) => {
      if (tags.has("history-merge") || dirtyElements.size === 0) return;
      anchorAll();
    });
  }, [editor, threads]);
  return null;
};

const Textarea: FC<{
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}> = ({ label, onChange, placeholder, value }) => (
  <textarea
    aria-label={label}
    className="min-h-16 w-full rounded-md border border-border bg-surface p-2 text-sm text-ink"
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    value={value}
  />
);

/** The card under the toolbar's Comment button. The selection's anchor is read when it opens. */
const CommentCard: FC<{
  onAdd: NonNullable<ReviewComments["onAdd"]>;
  selection: KoenigToolbarSelection;
}> = ({ onAdd, selection: { close, editor } }) => {
  const { t } = useTranslation("authoring");
  const [anchor] = useState(() => editor.getEditorState().read($selectionAnchor));
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!anchor || !body.trim()) return;
    setBusy(true);
    try {
      await onAdd({ ...anchor, body: body.trim() });
      close();
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      aria-label={t("editor.comments.button")}
      className="flex w-72 flex-col gap-2 rounded-[10px] border border-border bg-surface p-2.5 shadow-lg"
      onSubmit={submit}
    >
      <Textarea
        label={t("editor.comments.button")}
        onChange={setBody}
        placeholder={t("editor.comments.placeholder")}
        value={body}
      />
      <div className="flex justify-end gap-2">
        <button className="rounded-md px-2.5 py-1.5 text-sm" onClick={close} type="button">
          {t("editor.comments.cancel")}
        </button>
        <button
          className="rounded-md bg-primary px-2.5 py-1.5 text-sm font-medium text-on-primary disabled:opacity-60"
          disabled={busy || !anchor || !body.trim()}
          type="submit"
        >
          {t("editor.comments.send")}
        </button>
      </div>
    </form>
  );
};

const BubbleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M5 5h14v10H10l-4 4v-4H5z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

/** The Comment button and its card for the selection toolbar. */
export const createCommentToolbarAction = (
  label: string,
  onAdd: ReviewComments["onAdd"],
): KoenigToolbarAction => ({
  Card: onAdd
    ? function CommentToolbarCard(selection: KoenigToolbarSelection) {
        return <CommentCard onAdd={onAdd} selection={selection} />;
      }
    : undefined,
  hidden: !onAdd,
  Icon: BubbleIcon,
  id: "comment",
  label,
});

const ThreadCard: FC<{
  active: boolean;
  comments: ReviewComments;
  focus: (id: null | string) => void;
  thread: ReviewThreadView;
}> = ({ active, comments, focus, thread }) => {
  const { t } = useTranslation("authoring");
  const [reply, setReply] = useState("");
  const first = thread.messages[0];
  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!reply.trim()) return;
    await comments.onReply(thread.id, reply.trim());
    setReply("");
  };
  return (
    <li
      aria-current={active}
      className={`flex flex-col gap-2 rounded-lg border bg-surface p-3 text-sm text-ink ${
        active ? "border-primary" : "border-border"
      } ${thread.resolved ? "opacity-70" : ""}`}
    >
      <button
        aria-label={t("editor.comments.threadLabel", { quote: thread.quote })}
        className="text-left text-muted italic"
        onClick={() => focus(thread.id)}
        type="button"
      >
        “{thread.quote}”
      </button>
      <ol className="flex flex-col gap-1.5">
        {thread.messages.map((message) => (
          <li key={message.id}>
            <b>
              {message.authorUserId === comments.meId
                ? t("editor.comments.you")
                : (message.authorName ?? message.authorUserId)}
            </b>
            : {message.body || t("editor.comments.unreadable")}
          </li>
        ))}
      </ol>
      {thread.resolved ? (
        <span className="text-xs text-muted">{t("editor.comments.resolved")}</span>
      ) : (
        <form className="flex flex-col gap-1.5" onSubmit={send}>
          <Textarea
            label={t("editor.comments.replyLabel")}
            onChange={setReply}
            placeholder={t("editor.comments.replyPlaceholder")}
            value={reply}
          />
          <button
            className="self-end rounded-md px-2.5 py-1 text-sm font-medium text-primary disabled:opacity-60"
            disabled={!reply.trim()}
            type="submit"
          >
            {t("editor.comments.reply")}
          </button>
        </form>
      )}
      <div className="flex justify-end gap-3">
        <button
          className="text-sm text-primary"
          onClick={() => void comments.onResolve(thread.id, !thread.resolved)}
          type="button"
        >
          {thread.resolved ? t("editor.comments.reopen") : t("editor.comments.resolve")}
        </button>
        {comments.onDelete && first?.authorUserId === comments.meId ? (
          <button
            aria-label={t("editor.comments.deleteLabel")}
            className="text-sm text-muted"
            onClick={() => void comments.onDelete?.(thread.id)}
            type="button"
          >
            {t("editor.comments.delete")}
          </button>
        ) : null}
      </div>
    </li>
  );
};

/** The threads beside the document; a click on a highlight makes its thread the active one. */
export const ReviewThreadsPanel: FC<{ comments: ReviewComments }> = ({ comments }) => {
  const { t } = useTranslation("authoring");
  const api = useKoenigComments();
  return (
    <section
      aria-label={t("editor.comments.title")}
      className="flex w-full flex-none flex-col gap-2 lg:w-72"
    >
      <h2 className="text-sm font-semibold text-ink">{t("editor.comments.title")}</h2>
      {comments.threads.length === 0 ? (
        <p className="text-sm text-muted">{t("editor.comments.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.threads.map((thread) => (
            <ThreadCard
              active={api?.activeThreadId === thread.id}
              comments={comments}
              focus={(id) => api?.controller.focusThread(id)}
              key={thread.id}
              thread={thread}
            />
          ))}
        </ul>
      )}
    </section>
  );
};
