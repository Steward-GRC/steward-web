// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Button, type Failure, Spinner } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { listPolicies } from "@steward-web/ui/domain/server";
import { Send, Sparkles } from "lucide-react";
import { Fragment, type ReactNode, useId, useRef, useState } from "react";
import { Form, Link, useNavigation, useSubmit } from "react-router";

import type { Route } from "./+types/ask";

import { answerParts } from "../ask/answerParts";
import { type Answer, ask, topQuestions } from "../ask/ask.server";
import { getAiHealth } from "../authoring/ai.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const health = await getAiHealth(request).catch(() => ({ available: false }));
  return {
    available: health.available,
    suggestions: health.available ? await topQuestions(request) : [],
  };
};

export const action = async ({
  request,
}: Route.ActionArgs): Promise<{ answer?: Answer; failure?: Failure }> => {
  await requireIdentityFromRequest(request);
  const form = await request.formData();
  const question = String(form.get("question") ?? "").trim();
  if (!question) return { failure: { status: 400 } };
  const cookie = request.headers.get("cookie") ?? undefined;
  try {
    const answer = await ask(request, question, async () => [
      ...(await listPolicies(DocumentType.Policy, cookie)),
      ...(await listPolicies(DocumentType.Procedure, cookie)),
    ]);
    return { answer };
  } catch (error) {
    return { failure: refusalOf(error) };
  }
};

const card = "rounded-lg border border-border bg-surface";

/** A small state card under the composer (U6): pending, nothing answers it, unavailable. */
const StateCard = ({ children }: { children: ReactNode }) => (
  <div className={`${card} flex items-center gap-2.5 rounded-[8px] p-3.5 text-sm`}>{children}</div>
);

const Unavailable = () => {
  const { t } = useTranslation("ai");
  return (
    <StateCard>
      <span className="leading-[1.45] text-muted">{t("ask.unavailable")}</span>
    </StateCard>
  );
};

/** The answer (U6): the reading face with [n] after each cited span, then the sources. */
const AnswerCard = ({ answer }: { answer: Answer }) => {
  const { t } = useTranslation("ai");
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-6 py-5 text-ink"
    >
      <div className="flex items-center gap-2.5">
        <Sparkles aria-hidden="true" className="size-4 text-primary" />
        <h2 className="text-[15px] font-semibold" id={titleId}>
          {t("ask.answer")}
        </h2>
        {answer.hasSensitiveSource ? (
          <span
            className="rounded-sm px-[7px] py-0.5 text-2xs font-semibold"
            style={{
              background: "var(--sensitivity-sensitive-soft)",
              color: "var(--sensitivity-sensitive)",
            }}
          >
            {t("ask.sensitive")}
          </span>
        ) : null}
      </div>
      <p className="font-serif text-[17px] leading-[1.65]">
        {answerParts(answer.answer, answer.citations, answer.segments).map((part, index) => (
          <Fragment key={index}>
            {part.text}
            {part.cites.map((n) => (
              <sup className="px-0.5 font-sans text-2xs font-semibold" key={n}>
                <a className="text-primary no-underline" href={`#cite-${n}`}>
                  [{n}]
                </a>
              </sup>
            ))}
          </Fragment>
        ))}
      </p>
      {answer.citations.length > 0 ? (
        <ol className="flex list-decimal flex-col gap-1 border-t border-border pt-3 pl-[22px] text-sm">
          {answer.citations.map((citation, index) => (
            <li id={`cite-${index + 1}`} key={`${citation.policyId}-${citation.sectionKey}`}>
              <Link className="font-semibold text-primary" to={citation.to}>
                {citation.label}
              </Link>
            </li>
          ))}
        </ol>
      ) : null}
      <p className="rounded-[8px] bg-sunken px-3 py-2.5 text-sm">
        <b>{t("ask.check.title")}</b> · {t("ask.check.body")}
      </p>
    </section>
  );
};

/**
 * Ask policies & procedures (U6; decision 5-screens.s6): a question in plain language, answered
 * from the policies and procedures the person can read, with numbered citations that link to
 * their sections. While AI is off it says so, and everything else keeps working.
 */
export default function Ask({ actionData, loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("ai");
  const navigation = useNavigation();
  const submit = useSubmit();
  const form = useRef<HTMLFormElement>(null);
  const [question, setQuestion] = useState("");
  // The question last sent, repeated as a bubble above its answer on a phone (U6m).
  const [asked, setAsked] = useState("");
  const asking = navigation.state === "submitting" && navigation.formAction?.endsWith("/ask");
  const triesId = useId();

  const send = (text: string) => {
    if (!text.trim()) return;
    setAsked(text.trim());
    void submit({ question: text }, { method: "post" });
  };

  return (
    // On a phone the question box is pinned to the bottom (U6m); keep the page clear of it.
    <div className="flex w-full flex-col gap-4 p-6 text-base text-ink max-md:pb-28 sm:px-8 sm:py-7">
      <div className="flex max-w-[720px] flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-semibold">{t("ask.title")}</h1>
        <p className="leading-normal text-muted">{t("ask.description")}</p>
      </div>

      {loaderData.available ? (
        <>
          <Form
            aria-label={t("ask.question")}
            className={`${card} flex flex-col gap-2 rounded-xl p-3.5 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-[var(--z-sticky)] max-md:flex-row max-md:items-center max-md:rounded-none max-md:border-x-0 max-md:border-b-0 max-md:border-border-strong max-md:px-3 max-md:pt-2.5 max-md:pb-5`}
            method="post"
            onSubmit={() => setAsked(question.trim())}
            ref={form}
          >
            <textarea
              aria-label={t("ask.question")}
              className="min-h-12 resize-none bg-transparent text-md leading-normal outline-none placeholder:text-muted max-md:h-11 max-md:min-h-0 max-md:flex-1 max-md:rounded-full max-md:border max-md:border-control max-md:px-3.5 max-md:py-2.5 max-md:text-base"
              name="question"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(question);
                }
              }}
              placeholder={t("ask.placeholder")}
              value={question}
            />
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-muted max-md:hidden">{t("ask.hint")}</span>
              <Button
                className="ml-auto h-[38px] px-4 max-md:size-11 max-md:rounded-full max-md:px-0"
                disabled={!question.trim() || asking}
                type="submit"
              >
                <span className="max-md:sr-only">{t("ask.submit")}</span>
                <Send aria-hidden="true" />
              </Button>
            </div>
          </Form>

          {loaderData.suggestions.length > 0 ? (
            <div
              aria-labelledby={triesId}
              className="flex flex-wrap items-center gap-2"
              role="group"
            >
              <span className="text-sm text-muted" id={triesId}>
                {t("ask.tryAsking")}
              </span>
              {loaderData.suggestions.map((suggestion) => (
                <button
                  className="flex h-[30px] items-center rounded-full bg-surface px-3 text-sm shadow-[inset_0_0_0_1px_var(--border-strong)] hover:bg-primary-soft"
                  key={suggestion}
                  onClick={() => {
                    setQuestion(suggestion);
                    send(suggestion);
                  }}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          {asked && (asking || actionData) ? (
            <p
              aria-label={t("ask.question")}
              className="max-w-[85%] self-end rounded-[12px_12px_2px_12px] bg-primary-soft px-3 py-2.5 text-on-primary-soft md:hidden"
              role="note"
            >
              {asked}
            </p>
          ) : null}

          {asking ? (
            <StateCard>
              <Spinner />
              <span className="text-muted">{t("ask.reading")}</span>
            </StateCard>
          ) : actionData?.failure ? (
            <Unavailable />
          ) : actionData?.answer?.noAuthorizedSource ? (
            <div className={`${card} flex flex-col gap-1 rounded-[8px] p-3.5 text-sm`}>
              <b>{t("ask.noAnswer")}</b>
              <Link className="font-semibold text-primary" to="/policies">
                {t("ask.browse")}
              </Link>
            </div>
          ) : actionData?.answer ? (
            <AnswerCard answer={actionData.answer} />
          ) : null}
        </>
      ) : (
        <Unavailable />
      )}
    </div>
  );
}
