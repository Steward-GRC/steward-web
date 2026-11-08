import { $isMarkNode, MarkNode } from "@lexical/mark";
// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Inline review comments (bug log 42). An approver selects text in the version under review and
// comments on it; the drafter sees the thread on the highlighted text, replies and resolves.
// The service keeps each thread (its quote, which match of it, its messages); the editor draws
// the highlight, which this puts back each time the document opens (`ReviewThreadAnchors`).
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useTranslation } from "@steward-web/i18n";
import { $getRoot, $nodesOfType } from "lexical";
import {
  type KoenigToolbarAction,
  type KoenigToolbarSelection,
  useKoenigComments,
} from "node-koenig-editor";
import { type FC, type FormEvent, type ReactNode, useEffect, useState } from "react";

import {
  $anchorThread,
  $replaceQuote,
  $selectionAnchor,
  nthIndexOf,
  type TextAnchor,
} from "./reviewAnchors";
import {
  outcomeOf,
  type SuggestionAction,
  suggestionActions,
  type SuggestionOutcome,
  type SuggestionSide,
} from "./suggestionActions";

/** What a host passes to show and change review threads in the editor. */
export interface ReviewComments {
  /** The signed-in person, so their own threads can be deleted. */
  meId: string;
  /**
   * Starts a thread on the selection. Without it there's no Comment button. `suggestedText` is
   * present only when the person changed the selected words in the form.
   */
  onAdd?: (draft: { body: string; suggestedText?: string } & TextAnchor) => Promise<void> | void;
  /** Ends a suggestion with an outcome (a reason for "not agreed"). Without it none can be ended. */
  onClose?: (threadId: string, outcome: SuggestionOutcome, reason?: string) => Promise<void> | void;
  /** Answers a suggestion with other text. */
  onCounter?: (threadId: string, text: string) => Promise<void> | void;
  onDelete?: (threadId: string) => Promise<void> | void;
  onReply: (threadId: string, body: string) => Promise<void> | void;
  onResolve: (threadId: string, resolved: boolean) => Promise<void> | void;
  /**
   * Draws the change from the first text to the second, such as a word diff. The editor package
   * cannot import the host's kit, so without it the proposed text is shown plainly.
   */
  renderDiff?: (before: string, after: string) => ReactNode;
  /** Which side the person acts on in a suggestion: an author of the policy, or a reviewer. */
  side?: SuggestionSide;
  threads: readonly ReviewThreadView[];
}

export interface ReviewThreadMessage {
  authorName: null | string;
  authorUserId: string;
  body: string;
  createdAt: string;
  id: string;
}

/** The replacement text proposed for a thread's quote, and how it stands. */
export interface ReviewThreadSuggestion {
  closedBy: null | string;
  closedText: null | string;
  outcome: null | SuggestionOutcome;
  reason: null | string;
  rounds: readonly { by: SuggestionSide; createdAt: string; text: string; userId: string }[];
  text: string;
  turn: SuggestionSide;
}

export interface ReviewThreadView extends TextAnchor {
  createdAt: string;
  id: string;
  messages: readonly ReviewThreadMessage[];
  resolved: boolean;
  suggestion?: null | ReviewThreadSuggestion;
}

/** True once the suggestion on a thread has ended: its highlight is gone and it is listed Closed. */
export const isClosedSuggestion = (thread: ReviewThreadView): boolean =>
  Boolean(thread.suggestion?.outcome);

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
  // starts as the selected words: changing them is what makes the comment a suggestion
  const [suggested, setSuggested] = useState(anchor?.quote ?? "");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!anchor || !body.trim()) return;
    setBusy(true);
    try {
      const proposed = suggested.trim();
      await onAdd({
        ...anchor,
        body: body.trim(),
        ...(proposed && proposed !== anchor.quote.trim() ? { suggestedText: proposed } : {}),
      });
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
      <Textarea
        label={t("editor.comments.suggestedText")}
        onChange={setSuggested}
        placeholder={t("editor.comments.suggestedText")}
        value={suggested}
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

const showChange = (comments: ReviewComments, before: string, after: string): ReactNode =>
  comments.renderDiff ? comments.renderDiff(before, after) : `“${after}”`;

/** The proposed text, the round, whose turn it is, and the actions open to this person now. */
const SuggestionBlock: FC<{
  comments: ReviewComments;
  thread: ReviewThreadView;
}> = ({ comments, thread }) => {
  const { t } = useTranslation("authoring");
  const api = useKoenigComments();
  const suggestion = thread.suggestion!;
  const [mode, setMode] = useState<"counter" | "notAgreed" | null>(null);
  const [counter, setCounter] = useState(suggestion.text);
  const [reason, setReason] = useState("");
  const [failed, setFailed] = useState(false);
  const side = comments.side;
  const actions = side
    ? suggestionActions({
        closed: false,
        firstBy: suggestion.rounds[0]?.by ?? "REVIEWER",
        side,
        turn: suggestion.turn,
      })
    : [];
  const attempt = async (work: () => Promise<void> | void) => {
    setFailed(false);
    try {
      await work();
    } catch {
      setFailed(true);
    }
  };
  const end = (outcome: SuggestionOutcome, why?: string) =>
    attempt(async () => {
      await comments.onClose?.(thread.id, outcome, why);
      // the highlight goes with the suggestion; the text stays
      api?.controller.removeThread(thread.id);
    });
  const run = (action: SuggestionAction) => {
    if (action === "counter" || action === "notAgreed") {
      setMode(mode === action ? null : action);
      return;
    }
    const outcome = outcomeOf(action);
    if (!outcome) return;
    if (action === "change") {
      // the text goes into the document first (autosave keeps it), then the suggestion ends
      void attempt(async () => {
        if (!api?.controller.replaceThreadText(thread.id, suggestion.text)) {
          throw new Error("the text changed");
        }
        await comments.onClose?.(thread.id, outcome);
        api.controller.removeThread(thread.id);
      });
      return;
    }
    void end(outcome);
  };
  const earlier = suggestion.rounds.slice(0, -1);
  return (
    <div className="flex flex-col gap-1.5" data-suggestion>
      <div>{showChange(comments, thread.quote, suggestion.text)}</div>
      <div className="flex gap-1.5 text-xs text-muted">
        {suggestion.rounds.length > 1 ? (
          <span>{t("editor.comments.round", { count: suggestion.rounds.length })}.</span>
        ) : null}
        <span>
          {suggestion.turn === "AUTHOR"
            ? t("editor.comments.waitingAuthor")
            : t("editor.comments.waitingReviewer")}
        </span>
      </div>
      {earlier.length > 0 ? (
        <details>
          <summary className="cursor-pointer text-xs text-muted">
            {t("editor.comments.earlierRounds")}
          </summary>
          {earlier.map((round, index) => (
            <div className="text-xs" key={index}>
              {showChange(
                comments,
                index === 0 ? thread.quote : earlier[index - 1]!.text,
                round.text,
              )}
            </div>
          ))}
        </details>
      ) : null}
      {actions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              className="rounded-md border border-border px-2 py-1 text-sm text-primary"
              key={action}
              onClick={() => run(action)}
              type="button"
            >
              {t(`editor.comments.actions.${action}`)}
            </button>
          ))}
        </div>
      ) : null}
      {mode === "counter" ? (
        <div className="flex flex-col gap-1.5">
          <Textarea
            label={t("editor.comments.counterLabel")}
            onChange={setCounter}
            placeholder={t("editor.comments.counterLabel")}
            value={counter}
          />
          <button
            className="self-end rounded-md px-2.5 py-1 text-sm font-medium text-primary disabled:opacity-60"
            disabled={!counter.trim() || counter.trim() === suggestion.text}
            onClick={() =>
              void attempt(async () => {
                await comments.onCounter?.(thread.id, counter.trim());
                setMode(null);
              })
            }
            type="button"
          >
            {t("editor.comments.sendCounter")}
          </button>
        </div>
      ) : null}
      {mode === "notAgreed" ? (
        <div className="flex flex-col gap-1.5">
          <Textarea
            label={t("editor.comments.reasonLabel")}
            onChange={setReason}
            placeholder={t("editor.comments.reasonPlaceholder")}
            value={reason}
          />
          <button
            className="self-end rounded-md px-2.5 py-1 text-sm font-medium text-primary disabled:opacity-60"
            disabled={!reason.trim()}
            onClick={() => void end("NOT_AGREED", reason.trim())}
            type="button"
          >
            {t("editor.comments.endNotAgreed")}
          </button>
        </div>
      ) : null}
      {failed ? (
        <p className="text-sm text-danger" role="alert">
          {t("editor.comments.closeFailed")}
        </p>
      ) : null}
    </div>
  );
};

const OUTCOME_KEY: Record<SuggestionOutcome, string> = {
  AGREED: "agreed",
  CHANGED: "changed",
  NOT_AGREED: "notAgreed",
  REMOVED: "removed",
  WITHDRAWN: "withdrawn",
};

/** One ended suggestion: what it was, how it ended, and, for an agreed text, applying it. */
const ClosedCard: FC<{ comments: ReviewComments; thread: ReviewThreadView }> = ({
  comments,
  thread,
}) => {
  const { t } = useTranslation("authoring");
  const [editor] = useLexicalComposerContext();
  const suggestion = thread.suggestion!;
  const outcome = suggestion.outcome!;
  // an agreed text the author has yet to put in the document: the quote is still there to replace
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const check = () => {
      const text = editor.getEditorState().read(() =>
        $getRoot()
          .getAllTextNodes()
          .map((node) => node.getTextContent())
          .join(""),
      );
      setPending(
        outcome === "AGREED" &&
          comments.side === "AUTHOR" &&
          editor.isEditable() &&
          nthIndexOf(text, thread.quote, thread.occurrence) >= 0,
      );
    };
    check();
    return editor.registerUpdateListener(check);
  }, [comments.side, editor, outcome, thread.occurrence, thread.quote]);
  const who =
    suggestion.closedBy === comments.meId
      ? t("editor.comments.you")
      : (thread.messages.find((message) => message.authorUserId === suggestion.closedBy)
          ?.authorName ??
        suggestion.closedBy ??
        "");
  return (
    <li
      className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 text-sm text-ink"
      data-closed={outcome}
    >
      <span className="text-muted italic">“{thread.quote}”</span>
      <div>
        <b>{t(`editor.comments.outcome.${OUTCOME_KEY[outcome]}`)}</b>{" "}
        {t("editor.comments.closedBy", { who })}
      </div>
      {suggestion.closedText && (outcome === "CHANGED" || outcome === "AGREED") ? (
        <div>{showChange(comments, thread.quote, suggestion.closedText)}</div>
      ) : null}
      {suggestion.reason ? (
        <div className="text-xs text-muted">
          {t("editor.comments.reason", { reason: suggestion.reason })}
        </div>
      ) : null}
      {pending ? (
        <button
          className="self-start rounded-md border border-border px-2 py-1 text-sm text-primary"
          onClick={() =>
            editor.update(() => {
              $replaceQuote(
                { occurrence: thread.occurrence, quote: thread.quote },
                suggestion.closedText ?? "",
              );
            })
          }
          type="button"
        >
          {t("editor.comments.applyAgreed")}
        </button>
      ) : null}
    </li>
  );
};

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
      {thread.suggestion ? <SuggestionBlock comments={comments} thread={thread} /> : null}
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
        {thread.suggestion ? null : (
          <button
            className="text-sm text-primary"
            onClick={() => void comments.onResolve(thread.id, !thread.resolved)}
            type="button"
          >
            {thread.resolved ? t("editor.comments.reopen") : t("editor.comments.resolve")}
          </button>
        )}
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
  const open = comments.threads.filter((thread) => !isClosedSuggestion(thread));
  const closed = comments.threads.filter(isClosedSuggestion);
  return (
    <section
      aria-label={t("editor.comments.title")}
      className="flex w-full flex-none flex-col gap-2 lg:w-72"
    >
      <h2 className="text-sm font-semibold text-ink">{t("editor.comments.title")}</h2>
      {open.length === 0 && closed.length === 0 ? (
        <p className="text-sm text-muted">{t("editor.comments.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {open.map((thread) => (
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
      {closed.length > 0 ? (
        <details className="flex flex-col gap-2">
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            {t("editor.comments.closed", { count: closed.length })}
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {closed.map((thread) => (
              <ClosedCard comments={comments} key={thread.id} thread={thread} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
};
