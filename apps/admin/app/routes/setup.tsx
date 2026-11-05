// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { GateAlert, GateBrand, GateCard, GatePage, Select } from "@steward-web/ui";
import { CircleCheck } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useId, useState } from "react";
import { data, Form, Link, redirect, useNavigate } from "react-router";

import type { Route } from "./+types/setup";

import { buildIdpConfig, clientSecretInput, idpConfigToRecord } from "../organisations/idpConfig";
import { findProvider, IDP_PROVIDERS, type IdpProtocol } from "../organisations/idpProviders";
import {
  bootstrapRoot,
  fetchSetupState,
  type SsoBootstrapInput,
  type SsoBootstrapResult,
} from "../setup/setup.server";

// First-run setup is a gate: a centred card outside the admin shell (decision
// 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

const BLANK_TOKEN = "Enter the setup token.";

export const loader = async () => {
  const state = await fetchSetupState();
  if (!state.needsSetup) throw redirect("/sign-in");
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");
  const setupToken = String(form.get("setupToken") ?? "");
  const enableSSO = form.get("enableSSO") === "on";

  if (!username || !email || !password || !confirmPassword) {
    return data(
      { code: "fields", ok: false, validationError: "All fields are required." } as const,
      { status: 400 },
    );
  }
  if (!setupToken.trim()) {
    return data(
      { code: "tokenBlank", field: "setupToken", ok: false, validationError: BLANK_TOKEN } as const,
      { status: 400 },
    );
  }
  if (username.includes("@")) {
    return data(
      {
        code: "username",
        ok: false,
        validationError: "Username must be a plain username, not an email address.",
      } as const,
      { status: 400 },
    );
  }
  if (password !== confirmPassword) {
    return data(
      { code: "passwords", ok: false, validationError: "Passwords do not match." } as const,
      { status: 400 },
    );
  }

  let sso: SsoBootstrapInput | undefined;
  if (enableSSO) {
    const orgName = String(form.get("orgName") ?? "").trim();
    const domain = String(form.get("domain") ?? "").trim();
    const providerId = String(form.get("providerId") ?? "");
    const provider = findProvider(providerId);
    if (!orgName || !domain || !provider) {
      return data(
        {
          code: "ssoFields",
          ok: false,
          validationError: "Organisation name, domain and identity provider are required.",
        } as const,
        { status: 400 },
      );
    }
    const protocol: IdpProtocol = provider.protocol;
    const entityId = String(form.get("entityId") ?? "");
    const ssoUrl = String(form.get("ssoUrl") ?? "");
    const signingCertificate = String(form.get("signingCertificate") ?? "");
    const issuer = String(form.get("issuer") ?? "");
    const clientId = String(form.get("clientId") ?? "");
    const clientSecret = String(form.get("clientSecret") ?? "").trim();
    const ssoDisplayName = String(form.get("ssoDisplayName") ?? "").trim();

    if (protocol === "saml" && (!entityId.trim() || !ssoUrl.trim() || !signingCertificate.trim())) {
      return data(
        {
          code: "saml",
          ok: false,
          validationError: "SAML requires the IdP entity ID, SSO URL and signing certificate.",
        } as const,
        { status: 400 },
      );
    }
    if (protocol === "oidc" && (!issuer.trim() || !clientId.trim())) {
      return data(
        {
          code: "oidc",
          ok: false,
          validationError: "OIDC requires the issuer and client ID.",
        } as const,
        { status: 400 },
      );
    }

    sso = {
      config: idpConfigToRecord(
        buildIdpConfig({ clientId, entityId, issuer, protocol, signingCertificate, ssoUrl }),
      ),
      displayName: ssoDisplayName || undefined,
      domain,
      orgName,
      protocol,
      ...clientSecretInput(protocol, clientSecret),
    };
  }

  const result = await bootstrapRoot({ email, name, password, setupToken, sso, username });
  if (result.status === 409) throw redirect("/sign-in");
  if (result.status === 403) {
    // The gateway checks the token only here, at bootstrap, so the page takes the visitor
    // back to the step where the token is typed.
    return data(
      {
        code: "token",
        field: "setupToken",
        ok: false,
        validationError: result.error ?? "Invalid setup token.",
      } as const,
      { status: 403 },
    );
  }
  if (!result.ok) {
    const code = result.status === 400 ? "fields" : result.status === 503 ? "disabled" : "failed";
    return data(
      { code, error: result.error ?? "An unexpected error occurred.", ok: false } as const,
      { status: result.status || 400 },
    );
  }
  return data({ ok: true, sso: result.sso } as const);
};

/** Why the action refused, as the page words it. */
type SetupProblem =
  | "already"
  | "disabled"
  | "failed"
  | "fields"
  | "oidc"
  | "passwords"
  | "saml"
  | "ssoFields"
  | "token"
  | "tokenBlank"
  | "username";

// The small gate card's controls (Gates G13–G15): 40 px fields that name themselves in their
// placeholder, a 42 px button and a 13 px link.
const input =
  "h-10 w-full rounded-md border border-control bg-surface px-2.5 text-sm text-ink placeholder:text-muted focus-visible:border-primary aria-invalid:border-danger";
const primary =
  "flex h-[42px] w-full items-center justify-center rounded-md bg-primary font-semibold text-on-primary hover:bg-primary-hover active:bg-primary-active";
const link = "self-start text-sm font-semibold text-primary hover:text-primary-hover";
const title = "text-[17px] leading-6 font-bold";
const body = "text-sm leading-normal text-muted";

/** A G13–G15 card: Steward, then the step, left-aligned (the canvas's "L" cards). */
const SetupCard = ({ children, label }: { children: ReactNode; label: string }) => {
  const headingId = useId();
  return (
    <GatePage>
      <GateCard aria-labelledby={headingId}>
        <GateBrand />
        <h1 className={title} id={headingId}>
          {label}
        </h1>
        {children}
      </GateCard>
    </GatePage>
  );
};

/** One copyable, monospaced value (G15): the DNS TXT record, pasted without retyping. */
const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const { t } = useTranslation("admin");
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span className="flex h-10 items-center gap-2 rounded-md border border-control px-2.5">
      <input
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink outline-none"
        readOnly
        value={value}
      />
      <button
        aria-label={copied ? t("setup.done.copied") : undefined}
        className="text-sm font-semibold text-primary hover:text-primary-hover"
        onClick={() => void handleCopy()}
        title={t("setup.done.copyLabel")}
        type="button"
      >
        {copied ? t("setup.done.copied") : t("setup.done.copy")}
      </button>
    </span>
  );
};

/**
 * G15: the root administrator is ready. Without SSO it goes on to sign in by itself; with SSO
 * it gives the DNS record that finishes enabling it, or says why SSO wasn't provisioned.
 */
const Done = ({ sso }: { sso?: SsoBootstrapResult }) => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const headingId = useId();
  const dv = sso?.domainVerification;
  useEffect(() => {
    if (sso) return;
    const timer = setTimeout(() => void navigate("/sign-in"), 2500);
    return () => clearTimeout(timer);
  }, [navigate, sso]);
  return (
    <GatePage>
      <GateCard aria-labelledby={headingId}>
        <GateBrand />
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-full bg-ok-soft text-xl text-ok"
        >
          <CircleCheck className="size-[1.15em]" />
        </span>
        <h1 className={title} id={headingId}>
          {t("setup.done.title")}
        </h1>
        {sso?.error ? (
          <>
            <p className="text-sm font-semibold text-ink">{t("setup.done.notProvisioned")}</p>
            <p className={body}>{sso.error}</p>
            <p className={body}>{t("setup.done.notProvisionedLater")}</p>
          </>
        ) : dv ? (
          <>
            <p className={body}>{t("setup.done.finishSso", { record: dv.dnsRecordName })}</p>
            <CopyRow label={t("setup.done.dnsValue")} value={dv.dnsRecordValue} />
            {dv.instructions ? <p className={body}>{dv.instructions}</p> : null}
          </>
        ) : sso ? null : (
          <p className={body}>{t("setup.done.redirecting")}</p>
        )}
        <Link className={primary} reloadDocument to="/sign-in">
          {t("setup.done.signIn")}
        </Link>
      </GateCard>
    </GatePage>
  );
};

/**
 * First-run setup (Gates G13, G14, G15) on the gate card, outside the admin shell: the root
 * administrator and the setup token, then single sign-on now or later, then done. Kubernetes
 * (Helm) installs only; an appliance makes its root administrator in its own first-boot setup.
 */
export default function Setup({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const [step, setStep] = useState<"account" | "sso">("account");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [clientProblem, setClientProblem] = useState<SetupProblem | undefined>();
  const [tokenProblem, setTokenProblem] = useState<SetupProblem | undefined>();
  const problemId = useId();

  const [enableSSO, setEnableSSO] = useState(false);
  const [providerId, setProviderId] = useState("");
  const provider = findProvider(providerId);

  // A token the gateway refused (or a blank one) is fixed on the account step, so a new
  // answer naming it goes back there with the token cleared and the other fields kept.
  const [seenActionData, setSeenActionData] = useState(actionData);
  if (actionData !== seenActionData) {
    setSeenActionData(actionData);
    if (actionData && !actionData.ok && "field" in actionData) {
      setStep("account");
      setSetupToken("");
      setTokenProblem(actionData.code);
    }
  }

  if (actionData?.ok) return <Done sso={actionData.sso} />;

  const handleAccountNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTokenProblem(undefined);
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setClientProblem("fields");
      return;
    }
    // The gateway has no way to check the token on its own: it is checked when the bootstrap
    // is sent, at the end. This step can only refuse a blank one.
    if (!setupToken.trim()) {
      setClientProblem(undefined);
      setTokenProblem("tokenBlank");
      return;
    }
    if (username.includes("@")) {
      setClientProblem("username");
      return;
    }
    if (password !== confirmPassword) {
      setClientProblem("passwords");
      return;
    }
    setClientProblem(undefined);
    setStep("sso");
  };

  const accountHiddenFields = (
    <>
      <input name="username" type="hidden" value={username} />
      <input name="email" type="hidden" value={email} />
      <input name="name" type="hidden" value={name} />
      <input name="password" type="hidden" value={password} />
      <input name="confirmPassword" type="hidden" value={confirmPassword} />
      <input name="setupToken" type="hidden" value={setupToken} />
    </>
  );

  const serverProblem =
    !actionData || actionData.ok || "field" in actionData ? undefined : actionData.code;

  if (step === "sso") {
    return (
      <SetupCard label={t("setup.sso.title")}>
        <p className={body}>
          {t("setup.sso.body")} {enableSSO ? null : t("setup.sso.localSignIn")}
        </p>
        {serverProblem ? <GateAlert>{t(`setup.problem.${serverProblem}`)}</GateAlert> : null}
        <Form className="flex flex-col gap-2.5" method="post">
          {accountHiddenFields}
          <input name="enableSSO" type="hidden" value={enableSSO ? "on" : ""} />

          {enableSSO ? (
            <>
              <input
                aria-label={t("setup.sso.organization")}
                className={input}
                name="orgName"
                placeholder={t("setup.sso.organization")}
                required
              />
              <input
                aria-label={t("setup.sso.domain")}
                className={input}
                name="domain"
                placeholder="example.org"
                required
              />
              <Select
                aria-label={t("setup.sso.provider")}
                className="h-10 text-sm"
                name="providerId"
                onValueChange={setProviderId}
                options={IDP_PROVIDERS.map((p) => ({ label: p.label, value: p.id }))}
                placeholder={t("setup.sso.choose")}
                value={providerId}
              />
              <input
                aria-label={t("setup.sso.displayName")}
                className={input}
                name="ssoDisplayName"
                placeholder={t("setup.sso.displayName")}
              />

              {provider?.protocol === "oidc" ? (
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-2.5 text-sm font-semibold text-ink">
                    {t("setup.sso.oidc")}
                  </legend>
                  <input
                    aria-label={t("setup.sso.issuer")}
                    className={input}
                    name="issuer"
                    placeholder="https://idp.example.org"
                  />
                  <input
                    aria-label={t("setup.sso.clientId")}
                    className={input}
                    name="clientId"
                    placeholder={t("setup.sso.clientId")}
                  />
                  <input
                    aria-label={t("setup.sso.clientSecret")}
                    autoComplete="off"
                    className={input}
                    name="clientSecret"
                    placeholder={t("setup.sso.clientSecret")}
                    type="password"
                  />
                </fieldset>
              ) : null}

              {provider && provider.protocol !== "oidc" ? (
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-2.5 text-sm font-semibold text-ink">
                    {t("setup.sso.saml")}
                  </legend>
                  <input
                    aria-label={t("setup.sso.entityId")}
                    className={input}
                    name="entityId"
                    placeholder="https://idp.example.org/metadata"
                  />
                  <input
                    aria-label={t("setup.sso.ssoUrl")}
                    className={input}
                    name="ssoUrl"
                    placeholder="https://idp.example.org/sso"
                  />
                  <textarea
                    aria-label={t("setup.sso.signingCertificate")}
                    className="min-h-24 w-full rounded-md border border-control bg-surface px-2.5 py-2 font-mono text-xs text-ink placeholder:text-muted"
                    name="signingCertificate"
                    placeholder={t("setup.sso.signingCertificate")}
                  />
                </fieldset>
              ) : null}

              <p className={body}>{t("setup.sso.verification")}</p>
              <button className={primary} type="submit">
                {t("setup.sso.finish")}
              </button>
              <button className={link} onClick={() => setEnableSSO(false)} type="button">
                {t("setup.sso.later")}
              </button>
            </>
          ) : (
            <>
              <button className={primary} onClick={() => setEnableSSO(true)} type="button">
                {t("setup.sso.now")}
              </button>
              <button className={link} type="submit">
                {t("setup.sso.skip")}
              </button>
            </>
          )}
        </Form>
      </SetupCard>
    );
  }

  const field = (
    labelKey: string,
    value: string,
    onChange: (value: string) => void,
    extra: Record<string, unknown> = {},
  ) => (
    <input
      aria-label={t(labelKey)}
      className={input}
      onChange={(event) => onChange(event.target.value)}
      placeholder={t(labelKey)}
      value={value}
      {...extra}
    />
  );

  return (
    <SetupCard label={t("setup.account.title")}>
      <p className={body}>{t("setup.account.body")}</p>
      {clientProblem ? <GateAlert>{t(`setup.problem.${clientProblem}`)}</GateAlert> : null}
      {tokenProblem ? (
        <GateAlert id={problemId}>{t(`setup.problem.${tokenProblem}`)}</GateAlert>
      ) : null}
      <form className="flex flex-col gap-2.5" noValidate onSubmit={handleAccountNext}>
        {field("setup.account.username", username, setUsername, {
          autoComplete: "off",
          required: true,
        })}
        {field("setup.account.email", email, setEmail, {
          autoComplete: "email",
          required: true,
          type: "email",
        })}
        {field("setup.account.displayName", name, setName, { autoComplete: "off" })}
        {field("setup.account.password", password, setPassword, {
          autoComplete: "new-password",
          required: true,
          type: "password",
        })}
        {field("setup.account.confirmPassword", confirmPassword, setConfirmPassword, {
          autoComplete: "new-password",
          required: true,
          type: "password",
        })}
        <input
          aria-describedby={tokenProblem ? problemId : undefined}
          aria-invalid={tokenProblem ? true : undefined}
          aria-label={t("setup.account.setupToken")}
          autoComplete="off"
          className={`${input} font-mono`}
          onChange={(event) => setSetupToken(event.target.value)}
          placeholder={t("setup.account.setupTokenHint")}
          required
          type="password"
          value={setupToken}
        />
        <button className={primary} type="submit">
          {t("setup.account.continue")}
        </button>
      </form>
    </SetupCard>
  );
}
