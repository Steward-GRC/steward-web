// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  cn,
  CodeBoxes,
  GateAlert,
  GateBrand,
  GateCard,
  GateOrganisation,
  GatePage,
  Loader,
  Lockup,
  QrCode,
  Spinner,
  Tooltip,
  Wordmark,
} from "@steward-web/ui";
import { KeyRound, Mail, Smartphone } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Form, Link, useFetcher, useNavigation, useSubmit } from "react-router";

import type {
  PasskeyChallenge,
  SignInCapabilities,
  SignInFactor,
  SignInState,
} from "./signInState";

import { askForPasskey, type PasskeyFailure, passkeysSupported } from "./passkey";
import { useSessionWatch } from "./sessionWatch";

export interface SignInProps {
  /** The admin console's sign-in: the saffron Admin tag beside Steward, as in its header. */
  admin?: boolean;
  /** What the gateway offers besides the password: the reset, passkeys and SSO. */
  capabilities: SignInCapabilities;
  /** Where to go once signed in; carried through every step. */
  next: string;
  /** The organisation's name for the slot that leads the card, or none. */
  organisation?: null | string;
  /** Rendered under the card: the dev quick login, where the build allows it. */
  quickLogin?: ReactNode;
  state: SignInState;
}

/** The form intents whose success opens a session; G9 shows while that session resolves. */
const SESSION_INTENTS = new Set(["dev-quick-login", "enrol", "login", "passkey-finish", "verify"]);

// The G3 card's controls on a phone (G3m) and from 640 px up (G3).
const fieldLabel = "flex flex-col gap-[5px] text-base font-medium sm:text-sm";
const fieldInput =
  "h-12 w-full rounded-md border border-control bg-surface px-3 text-md font-normal text-ink focus-visible:border-primary aria-invalid:border-2 aria-invalid:border-danger aria-invalid:px-[11px] sm:h-[42px] sm:px-2.5 sm:text-base sm:aria-invalid:px-[9px]";
const primaryButton =
  "flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-primary text-md font-semibold text-on-primary hover:bg-primary-hover active:bg-primary-active disabled:opacity-70 sm:h-11 sm:rounded-md sm:text-base";
// The canvas draws these outlines as inset shadows; a border looks the same and, unlike a
// shadow, survives high contrast (which turns every shadow off).
const outlineButton =
  "flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface text-base font-medium text-ink hover:bg-sunken hover:text-ink sm:h-[42px] sm:rounded-md";

// The small gate cards (G4, G6–G9): 40 px fields, a 42 px button, a 13 px link.
const smallInput =
  "h-10 w-full rounded-md border border-control bg-surface px-2.5 text-sm text-ink placeholder:text-muted focus-visible:border-primary aria-invalid:border-danger";
const smallButton =
  "flex h-[42px] w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-on-primary hover:bg-primary-hover active:bg-primary-active disabled:opacity-70";
const smallLink = "text-sm font-semibold text-primary hover:text-primary-hover";
const smallTitle = "text-[17px] leading-6 font-bold";

const Hidden = ({ fields }: { fields: Record<string, string | undefined> }) => (
  <>
    {Object.entries(fields).map(([name, value]) =>
      value === undefined ? null : <input key={name} name={name} type="hidden" value={value} />,
    )}
  </>
);

/** The secret as the authenticator apps print it: groups of four. */
const grouped = (secret: string) => secret.match(/.{1,4}/g)?.join(" ") ?? secret;

/** The full secret from the provisioning URI, for typing in; the masked one when there is none. */
const secretOf = (otpauthUri: string, masked: string): string => {
  try {
    return new URL(otpauthUri).searchParams.get("secret") ?? masked;
  } catch {
    return masked;
  }
};

/** Whether the browser can sign in with a passkey: known only after hydration. */
const usePasskeysSupported = () => {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser API exists only after hydration
    setSupported(passkeysSupported());
  }, []);
  return supported;
};

/**
 * A passkey round trip: the route's action asks the gateway for a challenge, the browser's own
 * prompt signs it (G5: "the browser's own prompt over the card"), and the signed answer goes
 * back to the action as a normal form post, so a session lands like any other sign-in.
 */
const usePasskey = (finish: (credentialJson: string, flowId: string) => Record<string, string>) => {
  const fetcher = useFetcher<PasskeyChallenge | SignInState>();
  const submit = useSubmit();
  const [failure, setFailure] = useState<"unavailable" | PasskeyFailure | undefined>();
  const handled = useRef<unknown>(undefined);
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    const answer = fetcher.data;
    if (fetcher.state !== "idle" || !answer || handled.current === answer) return;
    handled.current = answer;
    if (!("passkey" in answer)) {
      setFailure("unavailable");
      return;
    }
    const { flowId = "", optionsJson } = answer.passkey;
    void askForPasskey(optionsJson).then((result) => {
      if ("failure" in result) {
        setFailure(result.failure);
        return;
      }
      submit(finishRef.current(result.credentialJson, flowId), { method: "post" });
    });
  }, [fetcher.data, fetcher.state, submit]);

  return {
    busy: fetcher.state !== "idle",
    failure,
    start: (fields: Record<string, string>) => {
      setFailure(undefined);
      void fetcher.submit(fields, { method: "post" });
    },
  };
};

const passkeyProblem = (failure: "unavailable" | PasskeyFailure | undefined) =>
  failure === "cancelled"
    ? "passkeyCancelled"
    : failure === "failed"
      ? "passkey"
      : failure === "unavailable"
        ? "unavailable"
        : undefined;

/** The sign-in links stay inside the app, under its basename, and keep `next`. */
const stepLink = (next: string, step?: "reset" | "sso") => {
  const query = new URLSearchParams();
  if (step) query.set("step", step);
  query.set("next", next);
  return `?${query.toString()}`;
};

const Tagline = ({ className }: { className?: string }) => {
  const { t } = useTranslation("shell");
  return <p className={cn("text-sm text-muted", className)}>{t("brand.tagline")}</p>;
};

const AdminTag = () => {
  const { t } = useTranslation("auth");
  return (
    <span className="rounded-sm bg-accent-fill px-2 py-[3px] text-2xs font-semibold tracking-[.04em] text-on-accent">
      {t("signIn.adminTag")}
    </span>
  );
};

/** G3 and G3m: the organisation slot, Steward, the password form, then SSO and the passkey. */
const PasswordGate = ({
  admin,
  capabilities,
  next,
  organisation,
  quickLogin,
  state,
}: { state: Extract<SignInState, { view: "password" }> } & Omit<SignInProps, "state">) => {
  const { t } = useTranslation("auth");
  const navigation = useNavigation();
  const headingId = useId();
  const problemId = useId();
  const ssoReasonId = useId();
  const supported = usePasskeysSupported();
  const passkey = usePasskey((credentialJson, flowId) => ({
    credentialJson,
    flowId,
    intent: "passkey-finish",
    next,
  }));
  const submitting = navigation.state === "submitting";
  const problem = passkeyProblem(passkey.failure) ?? state.problem;
  const passwordWrong = problem === "invalid" || problem === "missing";
  const showPasskey = capabilities.passkey && supported;

  const brand = (
    <>
      {organisation ? <GateOrganisation name={organisation} /> : null}
      <span className="flex items-center gap-2.5">
        {organisation ? (
          <Wordmark fontSize={20} title={t("shell:brand.name")} />
        ) : (
          <Lockup fontSize={26} size={32} />
        )}
        {admin ? <AdminTag /> : null}
      </span>
      <Tagline />
    </>
  );

  return (
    <GatePage>
      <div className="flex flex-col items-center gap-2 sm:hidden">{brand}</div>
      <GateCard aria-labelledby={headingId} size="sign-in">
        <h1 className="sr-only" id={headingId}>
          {t("signIn.title")}
        </h1>
        <div className="hidden flex-col items-center gap-2 sm:flex">{brand}</div>
        {state.notice ? (
          <p
            className="flex items-center gap-2 rounded-lg bg-ok-soft px-3 py-2.5 text-sm text-ok"
            role="status"
          >
            {t(`signIn.notice.${state.notice}`)}
          </p>
        ) : null}
        {problem ? (
          <GateAlert id={problemId}>
            {problem === "quickLoginRefused"
              ? refusalMessage(t, state)
              : t(`signIn.problem.${problem}`)}
          </GateAlert>
        ) : null}
        <Form className="flex flex-col gap-3 sm:gap-[14px]" method="post">
          <Hidden fields={{ intent: "login", next }} />
          <label className={fieldLabel}>
            {t("signIn.identifier")}
            <input
              aria-describedby={problem === "missing" ? problemId : undefined}
              aria-invalid={problem === "missing" || undefined}
              autoComplete="username"
              className={fieldInput}
              defaultValue={state.identifier}
              name="identifier"
              required
              type="text"
            />
          </label>
          <div className={fieldLabel}>
            <span className="flex justify-between">
              <label htmlFor={`${headingId}-password`}>{t("signIn.password")}</label>
              {capabilities.passwordReset ? (
                <Link
                  className="hidden font-normal text-primary underline sm:inline"
                  to={stepLink(next, "reset")}
                >
                  {t("signIn.forgotPassword")}
                </Link>
              ) : null}
            </span>
            <input
              aria-describedby={passwordWrong ? problemId : undefined}
              aria-invalid={passwordWrong || undefined}
              autoComplete="current-password"
              className={fieldInput}
              id={`${headingId}-password`}
              name="password"
              required
              type="password"
            />
          </div>
          <button
            aria-busy={submitting || undefined}
            className={primaryButton}
            disabled={submitting}
            type="submit"
          >
            {submitting ? <Spinner /> : null}
            {t("signIn.submit")}
          </button>
          {capabilities.passwordReset ? (
            <Link
              className="text-center font-semibold text-primary sm:hidden"
              to={stepLink(next, "reset")}
            >
              {t("signIn.forgotPassword")}
            </Link>
          ) : null}
        </Form>
        <div className="hidden items-center gap-2.5 text-xs text-muted sm:flex">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          {t("signIn.or")}
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
        <div className="flex flex-col gap-3 sm:gap-[14px]">
          {capabilities.sso ? (
            <Link className={cn(outlineButton, "order-2 sm:order-1")} to={stepLink(next, "sso")}>
              {t("signIn.sso.label")}
            </Link>
          ) : (
            <Tooltip content={t("signIn.sso.unavailable")}>
              <button
                aria-describedby={ssoReasonId}
                aria-disabled="true"
                className={cn(
                  outlineButton,
                  "order-2 cursor-not-allowed opacity-55 hover:bg-surface sm:order-1",
                )}
                type="button"
              >
                {t("signIn.sso.label")}
              </button>
            </Tooltip>
          )}
          {capabilities.sso ? null : (
            <span className="sr-only" id={ssoReasonId}>
              {t("signIn.sso.unavailable")}
            </span>
          )}
          {showPasskey ? (
            <button
              aria-busy={passkey.busy || undefined}
              className={cn(outlineButton, "order-1 sm:order-2")}
              disabled={passkey.busy}
              onClick={() => passkey.start({ intent: "passkey-begin", next })}
              type="button"
            >
              <KeyRound aria-hidden="true" className="size-[1.15em]" />
              {t("signIn.passkey")}
            </button>
          ) : null}
        </div>
      </GateCard>
      {quickLogin ? <div className="w-full max-w-[400px]">{quickLogin}</div> : null}
    </GatePage>
  );
};

/** One of G6's method rows: 44 px, an icon and the method's name. */
const MethodRow = ({ children, icon }: { children: ReactNode; icon: ReactNode }) => (
  <span className="flex min-h-11 w-full items-center gap-2.5 rounded-lg border border-border px-3 text-sm text-ink hover:bg-sunken">
    {icon}
    {children}
  </span>
);

/** G6: choose a method when there are several, then the six-box verification code. */
const CodeGate = ({
  next,
  state,
}: {
  next: string;
  state: Extract<SignInState, { view: "code" }>;
}) => {
  const { t } = useTranslation("auth");
  const navigation = useNavigation();
  const headingId = useId();
  const problemId = useId();
  const [value, setValue] = useState("");
  const supported = usePasskeysSupported();
  const passkey = usePasskey((credentialJson) => ({
    credentialJson,
    factor: "passkey",
    factors: state.factors.join(","),
    intent: "verify",
    next,
    pendingId: state.pendingId,
  }));
  const carried = {
    factors: state.factors.join(","),
    next,
    pendingId: state.pendingId,
    sentTo: state.sentTo,
  };
  const offered = (factor: SignInFactor) =>
    state.factors.includes(factor) && (factor !== "passkey" || supported);
  const several = (["totp", "email", "passkey"] as const).filter((f) => offered(f)).length > 1;
  const problem = passkeyProblem(passkey.failure) ?? state.problem;
  const submitting = navigation.state === "submitting";

  if (state.choose) {
    return (
      <GatePage>
        <GateCard aria-labelledby={headingId} className="gap-2 p-5">
          <GateBrand />
          <h1 className="text-base font-bold" id={headingId}>
            {t("signIn.method.title")}
          </h1>
          {problem ? <GateAlert>{t(`signIn.problem.${problem}`)}</GateAlert> : null}
          <Form className="flex flex-col gap-2" method="post">
            <Hidden fields={{ ...carried, factor: "totp" }} />
            {offered("totp") ? (
              <button className="text-left" name="intent" type="submit" value="choose">
                <MethodRow icon={<Smartphone aria-hidden="true" className="size-[1.15em]" />}>
                  {t("signIn.method.totp")}
                </MethodRow>
              </button>
            ) : null}
            {offered("email") ? (
              <button className="text-left" name="intent" type="submit" value="email">
                <MethodRow icon={<Mail aria-hidden="true" className="size-[1.15em]" />}>
                  {t("signIn.method.email")}
                </MethodRow>
              </button>
            ) : null}
            {offered("passkey") ? (
              <button
                aria-busy={passkey.busy || undefined}
                className="text-left"
                disabled={passkey.busy}
                onClick={() =>
                  passkey.start({ intent: "mfa-passkey-begin", pendingId: state.pendingId })
                }
                type="button"
              >
                <MethodRow icon={<KeyRound aria-hidden="true" className="size-[1.15em]" />}>
                  {t("signIn.method.passkey")}
                </MethodRow>
              </button>
            ) : null}
          </Form>
        </GateCard>
      </GatePage>
    );
  }

  const email = state.factor === "email";
  return (
    <GatePage>
      <GateCard aria-labelledby={headingId} className="p-5">
        <GateBrand />
        <h1 className="text-base font-bold" id={headingId}>
          {t("signIn.code.title")}
        </h1>
        <p className="text-sm text-muted">
          {email && state.sentTo && state.emailSent
            ? t("signIn.code.sentTo", { address: state.sentTo })
            : email && state.emailSent
              ? t(`signIn.code.emailSent.${state.emailSent}`)
              : t(`signIn.code.prompt.${state.factor}`)}
        </p>
        <Form className="flex flex-col gap-2.5" method="post">
          <Hidden fields={{ ...carried, factor: state.factor, intent: "verify" }} />
          <CodeBoxes
            describedBy={problem ? problemId : undefined}
            invalid={problem === "wrong"}
            label={t("signIn.code.label")}
            name="code"
            onChange={setValue}
            value={value}
          />
          {problem ? (
            <p
              className="rounded-md bg-danger-soft px-2.5 py-2 text-xs text-danger"
              id={problemId}
              role="alert"
            >
              {t(`signIn.problem.${problem}`)}
            </p>
          ) : null}
          <button
            aria-busy={submitting || undefined}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {t("signIn.code.verify")}
          </button>
        </Form>
        {email ? (
          <Form className="flex justify-center" method="post">
            <Hidden fields={carried} />
            <button className={smallLink} name="intent" type="submit" value="email">
              {state.emailSent ? t("signIn.code.resend") : t("signIn.code.send")}
            </button>
          </Form>
        ) : null}
        {several ? (
          <Form className="flex justify-center" method="post">
            <Hidden fields={carried} />
            <button className={smallLink} name="intent" type="submit" value="method">
              {t("signIn.method.another")}
            </button>
          </Form>
        ) : null}
      </GateCard>
    </GatePage>
  );
};

/** G7: set up an authenticator app during a first sign-in. */
const EnrolGate = ({
  next,
  state,
}: {
  next: string;
  state: Extract<SignInState, { view: "enrol" }>;
}) => {
  const { t } = useTranslation("auth");
  const navigation = useNavigation();
  const headingId = useId();
  const problemId = useId();
  const submitting = navigation.state === "submitting";
  return (
    <GatePage>
      <GateCard aria-labelledby={headingId}>
        <GateBrand />
        <QrCode className="self-center" label={t("signIn.enrol.qr")} value={state.otpauthUri} />
        <h1 className={smallTitle} id={headingId}>
          {t("signIn.enrol.title")}
        </h1>
        <p className="text-sm leading-normal text-muted">
          {t("signIn.enrol.scan", { secret: grouped(secretOf(state.otpauthUri, state.secret)) })}
        </p>
        {state.problem ? (
          <GateAlert id={problemId}>{t(`signIn.problem.${state.problem}`)}</GateAlert>
        ) : null}
        <Form className="flex flex-col gap-2.5" method="post">
          <Hidden
            fields={{
              intent: "enrol",
              next,
              otpauthUri: state.otpauthUri,
              pendingId: state.pendingId,
              secret: state.secret,
            }}
          />
          <input
            aria-describedby={state.problem ? problemId : undefined}
            aria-invalid={state.problem === "wrong" || undefined}
            aria-label={t("signIn.enrol.code")}
            autoComplete="one-time-code"
            className={smallInput}
            inputMode="numeric"
            name="code"
            placeholder={t("signIn.enrol.code")}
            required
            type="text"
          />
          <button
            aria-busy={submitting || undefined}
            className={smallButton}
            disabled={submitting}
            type="submit"
          >
            {t("signIn.enrol.confirm")}
          </button>
        </Form>
      </GateCard>
    </GatePage>
  );
};

/** G4: the SSO identifier, which either leaves for the organisation's provider or comes back. */
const SsoGate = ({
  next,
  state,
}: {
  next: string;
  state: Extract<SignInState, { view: "sso" }>;
}) => {
  const { t } = useTranslation("auth");
  const navigation = useNavigation();
  const headingId = useId();
  const problemId = useId();
  const checking = navigation.state !== "idle" && navigation.formData?.get("intent") === "sso";
  return (
    <GatePage>
      <GateCard aria-labelledby={headingId}>
        <GateBrand />
        <h1 className={smallTitle} id={headingId}>
          {t("signIn.sso.title")}
        </h1>
        {state.problem ? (
          <GateAlert id={problemId}>{t(`signIn.sso.problem.${state.problem}`)}</GateAlert>
        ) : null}
        <Form className="flex flex-col gap-2.5" method="post">
          <Hidden fields={{ next }} />
          <input
            aria-describedby={state.problem ? problemId : undefined}
            aria-invalid={state.problem === "missing" || undefined}
            aria-label={t("signIn.sso.identifier")}
            autoComplete="username"
            className={smallInput}
            defaultValue={state.identifier}
            name="identifier"
            placeholder={t("signIn.sso.identifier")}
            required
            type="text"
          />
          <button
            aria-busy={checking || undefined}
            className={smallButton}
            disabled={checking}
            name="intent"
            type="submit"
            value="sso"
          >
            {checking ? t("signIn.sso.checking") : t("signIn.sso.continue")}
          </button>
        </Form>
        <Link className={smallLink} to={stepLink(next)}>
          {t("signIn.sso.back")}
        </Link>
      </GateCard>
    </GatePage>
  );
};

/** G8: the password reset by emailed code. It always moves on, so it never reveals an account. */
const ResetGate = ({
  next,
  state,
}: {
  next: string;
  state: Extract<SignInState, { view: "reset" }>;
}) => {
  const { t } = useTranslation("auth");
  const navigation = useNavigation();
  const headingId = useId();
  const problemId = useId();
  const submitting = navigation.state === "submitting";
  const described = state.problem ? problemId : undefined;
  return (
    <GatePage>
      <GateCard aria-labelledby={headingId}>
        <GateBrand />
        <h1 className={smallTitle} id={headingId}>
          {t("signIn.reset.title")}
        </h1>
        {state.problem ? (
          <GateAlert id={problemId}>{t(`signIn.reset.problem.${state.problem}`)}</GateAlert>
        ) : null}
        {state.step === "request" ? (
          <Form className="flex flex-col gap-2.5" method="post">
            <Hidden fields={{ next }} />
            <input
              aria-describedby={described}
              aria-invalid={state.problem === "missing" || undefined}
              aria-label={t("signIn.reset.email")}
              autoComplete="email"
              className={smallInput}
              defaultValue={state.email}
              name="email"
              placeholder={t("signIn.reset.email")}
              required
              type="email"
            />
            <button
              aria-busy={submitting || undefined}
              className={smallButton}
              disabled={submitting}
              name="intent"
              type="submit"
              value="reset-request"
            >
              {t("signIn.reset.send")}
            </button>
          </Form>
        ) : (
          <Form className="flex flex-col gap-2.5" method="post">
            <Hidden fields={{ email: state.email ?? "", next }} />
            <input
              aria-describedby={described}
              aria-invalid={state.problem === "code" || undefined}
              aria-label={t("signIn.reset.code")}
              autoComplete="one-time-code"
              className={smallInput}
              inputMode="numeric"
              name="code"
              placeholder={t("signIn.reset.code")}
              required
              type="text"
            />
            <input
              aria-label={t("signIn.reset.newPassword")}
              autoComplete="new-password"
              className={smallInput}
              name="newPassword"
              placeholder={t("signIn.reset.newPassword")}
              required
              type="password"
            />
            <button
              aria-busy={submitting || undefined}
              className={smallButton}
              disabled={submitting}
              name="intent"
              type="submit"
              value="reset-confirm"
            >
              {t("signIn.reset.set")}
            </button>
          </Form>
        )}
        <Link className={smallLink} to={stepLink(next)}>
          {t("signIn.reset.back")}
        </Link>
      </GateCard>
    </GatePage>
  );
};

/** G9: the looping loading mark while the new session resolves. */
const SigningInGate = () => {
  const { t } = useTranslation("auth");
  const headingId = useId();
  return (
    <GatePage>
      <GateCard aria-busy="true" aria-labelledby={headingId} className="items-center text-center">
        <GateBrand />
        <Loader decorative size={56} />
        <h1 className={smallTitle} id={headingId}>
          {t("signIn.signingIn")}
        </h1>
      </GateCard>
    </GatePage>
  );
};

/** The mock's refusal codes the page has friendly words for. */
const REFUSAL_CODES = new Set(["account_disabled", "no_password", "unknown_person"]);

/**
 * A refused dev quick login, in words: the mock's own message when it gave one, else "Couldn't
 * sign in as {name}." with what its error code means.
 */
const refusalMessage = (
  t: (key: string, values?: Record<string, string>) => string,
  state: { code?: string; message?: string; name?: string },
): string => {
  if (state.message) return state.message;
  if (!state.name) return t("signIn.problem.quickLoginRefused");
  const lead = t("signIn.refused.lead", { name: state.name });
  return state.code && REFUSAL_CODES.has(state.code)
    ? `${lead} ${t(`signIn.refused.code.${state.code}`)}`
    : lead;
};

/**
 * A session appeared while this page sat signed out (another tab, or the mock's own sign-in):
 * the page is already moving on, and says who is signed in with Refresh in case the move
 * stalls. G9's small card.
 */
const SignedInElsewhereGate = ({ name }: { name: string }) => {
  const { t } = useTranslation("auth");
  return (
    <GatePage>
      <GateCard className="items-center text-center">
        <GateBrand />
        <div className="flex flex-col items-center gap-3" role="status">
          <p className="text-base">
            {name ? t("signIn.elsewhere.signedInAs", { name }) : t("signIn.elsewhere.signedIn")}
          </p>
          <button
            className={primaryButton}
            onClick={() => globalThis.location.reload()}
            type="button"
          >
            {t("signIn.elsewhere.refresh")}
          </button>
        </div>
      </GateCard>
    </GatePage>
  );
};

/**
 * The sign-in gates (Gates G3, G3m, G4–G9), outside the app shell as one centred card: the
 * password step, the SSO identifier, a passkey, the second factor or a first-sign-in
 * authenticator enrolment, the password reset, and "Signing in…" while the session resolves.
 * Every form posts to this route's own action, which talks to the gateway server-side; the
 * browser never calls the gateway's `/auth` routes or Kratos directly and only ever holds the
 * gateway's HttpOnly session cookie.
 */
export const SignIn = (props: SignInProps) => {
  const navigation = useNavigation();
  const { next, state } = props;
  const signedInAs = useSessionWatch(next);
  const intent = navigation.formData?.get("intent");
  // An action that opened a session answers with a redirect; the router then loads the next
  // page with the submission still attached.
  const resolving =
    navigation.state === "loading" && typeof intent === "string" && SESSION_INTENTS.has(intent);

  if (signedInAs !== undefined) return <SignedInElsewhereGate name={signedInAs} />;
  if (resolving || state.view === "signing-in") return <SigningInGate />;
  switch (state.view) {
    case "code": {
      return <CodeGate next={next} state={state} />;
    }
    case "enrol": {
      return <EnrolGate next={next} state={state} />;
    }
    case "password": {
      return <PasswordGate {...props} state={state} />;
    }
    case "reset": {
      return <ResetGate next={next} state={state} />;
    }
    case "sso": {
      return <SsoGate next={next} state={state} />;
    }
  }
};
