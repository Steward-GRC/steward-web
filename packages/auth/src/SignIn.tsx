// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Banner, Button, Field, Input } from "@steward-web/ui";
import { Form } from "react-router";

import type { SignInState } from "./signInState";

export interface SignInProps {
  /** "Steward" for the staff app, "Steward Admin" for the admin app. */
  cardTitle: string;
  /** Where to go once signed in; carried through every step. */
  next: string;
  state: SignInState;
}

const Problem = ({ text }: { text: string | undefined }) => {
  const { t } = useTranslation("auth");
  return text ? (
    <Banner title={t("signIn.failedTitle")} tone="danger">
      {text}
    </Banner>
  ) : null;
};

/**
 * The sign-in screen: the password step, then the second-factor code or a first-sign-in
 * authenticator enrolment when the gateway asks for one. Every form posts to this route's own
 * action, which talks to the gateway server-side; the browser never calls the gateway's
 * `/auth` routes or Kratos directly and only ever holds the gateway's HttpOnly session cookie.
 */
export const SignIn = ({ cardTitle, next, state }: SignInProps) => {
  const { t } = useTranslation("auth");

  return (
    <div className="mx-auto grid w-full max-w-sm gap-6 py-16">
      <h1 className="text-center text-xl font-semibold text-ink">{cardTitle}</h1>

      {state.view === "password" ? (
        <>
          <Problem text={state.problem ? t(`signIn.problem.${state.problem}`) : undefined} />
          <Form className="grid gap-4" method="post">
            <input name="intent" type="hidden" value="login" />
            <input name="next" type="hidden" value={next} />
            <Field label={t("signIn.identifier")}>
              <Input
                autoComplete="username"
                defaultValue={state.identifier}
                name="identifier"
                required
                type="text"
              />
            </Field>
            <Field label={t("signIn.password")}>
              <Input autoComplete="current-password" name="password" required type="password" />
            </Field>
            <Button type="submit">{t("signIn.continue")}</Button>
          </Form>
        </>
      ) : null}

      {state.view === "code" ? (
        <>
          <Problem text={state.problem ? t(`signIn.problem.${state.problem}`) : undefined} />
          {state.emailSent ? (
            <Banner title={t(`signIn.code.emailSent.${state.emailSent}`)} tone="info" />
          ) : null}
          <p className="text-base text-ink">{t(`signIn.code.prompt.${state.factor}`)}</p>
          <Form className="grid gap-4" method="post">
            <input name="intent" type="hidden" value="verify" />
            <input name="next" type="hidden" value={next} />
            <input name="pendingId" type="hidden" value={state.pendingId} />
            <input name="factor" type="hidden" value={state.factor} />
            <input name="factors" type="hidden" value={state.factors.join(",")} />
            <Field label={t("signIn.code.label")}>
              <Input
                autoComplete="one-time-code"
                inputMode="numeric"
                name="code"
                required
                type="text"
              />
            </Field>
            <Button type="submit">{t("signIn.continue")}</Button>
          </Form>
          {state.factors.includes("email") ? (
            <Form method="post">
              <input name="intent" type="hidden" value="email" />
              <input name="next" type="hidden" value={next} />
              <input name="pendingId" type="hidden" value={state.pendingId} />
              <input name="factors" type="hidden" value={state.factors.join(",")} />
              <Button type="submit" variant="secondary">
                {t("signIn.code.sendEmail")}
              </Button>
            </Form>
          ) : null}
        </>
      ) : null}

      {state.view === "enrol" ? (
        <>
          <Problem text={state.problem ? t(`signIn.problem.${state.problem}`) : undefined} />
          <p className="text-base text-ink">{t("signIn.enrol.prompt")}</p>
          <a className="break-all text-primary hover:underline" href={state.otpauthUri}>
            {t("signIn.enrol.openApp")}
          </a>
          {state.secret ? (
            <p className="text-sm text-muted">
              {t("signIn.enrol.secret", { secret: state.secret })}
            </p>
          ) : null}
          <Form className="grid gap-4" method="post">
            <input name="intent" type="hidden" value="enrol" />
            <input name="next" type="hidden" value={next} />
            <input name="pendingId" type="hidden" value={state.pendingId} />
            <input name="otpauthUri" type="hidden" value={state.otpauthUri} />
            <input name="secret" type="hidden" value={state.secret} />
            <Field label={t("signIn.code.label")}>
              <Input
                autoComplete="one-time-code"
                inputMode="numeric"
                name="code"
                required
                type="text"
              />
            </Field>
            <Button type="submit">{t("signIn.continue")}</Button>
          </Form>
        </>
      ) : null}
    </div>
  );
};
