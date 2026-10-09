// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Banner, Button, Field, Input, Select, Textarea } from "@steward-web/ui";
import { type FormEvent, useState } from "react";
import { data, Form, redirect } from "react-router";

import type { Route } from "./+types/setup";

import { buildIdpConfig, clientSecretInput, idpConfigToRecord } from "../organisations/idpConfig";
import { findProvider, IDP_PROVIDERS, type IdpProtocol } from "../organisations/idpProviders";
import {
  bootstrapRoot,
  fetchSetupState,
  type SsoBootstrapInput,
  type SsoBootstrapResult,
} from "../setup/setup.server";

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

  if (!username || !email || !password || !confirmPassword || !setupToken) {
    return data({ ok: false, validationError: "All fields are required." } as const, {
      status: 400,
    });
  }
  if (username.includes("@")) {
    return data(
      {
        ok: false,
        validationError: "Username must be a plain username, not an email address.",
      } as const,
      { status: 400 },
    );
  }
  if (password !== confirmPassword) {
    return data({ ok: false, validationError: "Passwords do not match." } as const, {
      status: 400,
    });
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
          ok: false,
          validationError: "SAML requires the IdP entity ID, SSO URL and signing certificate.",
        } as const,
        { status: 400 },
      );
    }
    if (protocol === "oidc" && (!issuer.trim() || !clientId.trim())) {
      return data(
        { ok: false, validationError: "OIDC requires the issuer and client ID." } as const,
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
  if (!result.ok) {
    return data({ error: result.error ?? "An unexpected error occurred.", ok: false } as const, {
      status: result.status || 400,
    });
  }
  return data({ ok: true, sso: result.sso } as const);
};

/** One copyable, monospaced value — the DNS TXT record, so the operator can paste it into
 *  their DNS zone without transcription errors. */
const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <Input className="font-mono text-sm" readOnly value={value} />
        <Button
          aria-label={`Copy ${label}`}
          onClick={() => void handleCopy()}
          type="button"
          variant="secondary"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </Field>
  );
};

const Done = ({ sso }: { sso?: SsoBootstrapResult }) => {
  const dv = sso?.domainVerification;
  return (
    <div className="mx-auto grid w-full max-w-lg gap-6 py-16">
      <h1 className="text-center text-xl font-semibold text-ink">Setup complete</h1>
      {sso ? (
        sso.error ? (
          <Banner title="SSO not fully provisioned" tone="warn">
            {sso.error} You can finish setting up SSO from Admin -&gt; Setup after signing in.
          </Banner>
        ) : (
          <Banner title="Finish enabling SSO" tone="info">
            The connection for <strong>{sso.organization?.domain}</strong> was created but is not
            active yet. Publish the DNS TXT record below, then complete verification, testing and
            activation from Admin -&gt; Setup.
          </Banner>
        )
      ) : (
        <p className="text-center text-sm text-muted">Your root administrator is ready.</p>
      )}
      {dv ? (
        <div className="flex flex-col gap-4">
          <CopyRow label="DNS record name" value={dv.dnsRecordName} />
          <CopyRow label="DNS record value (TXT)" value={dv.dnsRecordValue} />
          {dv.instructions ? <p className="text-sm text-muted">{dv.instructions}</p> : null}
        </div>
      ) : null}
      <Button asChild className="justify-self-center">
        <a href="/sign-in">Go to sign in</a>
      </Button>
    </div>
  );
};

export default function Setup({ actionData }: Route.ComponentProps) {
  const [step, setStep] = useState<"account" | "sso">("account");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [clientError, setClientError] = useState("");

  const [enableSSO, setEnableSSO] = useState(false);
  const [providerId, setProviderId] = useState("");
  const provider = findProvider(providerId);

  if (actionData?.ok) return <Done sso={actionData.sso} />;

  const handleAccountNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !email.trim() || !password || !confirmPassword || !setupToken.trim()) {
      setClientError("All fields are required.");
      return;
    }
    if (username.includes("@")) {
      setClientError("Username must be a plain username, not an email address.");
      return;
    }
    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }
    setClientError("");
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

  const serverError =
    actionData && !actionData.ok && "validationError" in actionData
      ? actionData.validationError
      : actionData && !actionData.ok && "error" in actionData
        ? actionData.error
        : undefined;

  if (step === "sso") {
    return (
      <div className="mx-auto grid w-full max-w-lg gap-6 py-16">
        <h1 className="text-center text-xl font-semibold text-ink">Single sign-on (optional)</h1>
        <p className="text-center text-sm text-muted">
          Connect your organisation&apos;s identity provider now, or skip and set it up later from
          Admin -&gt; Setup.
        </p>
        <Form className="flex flex-col gap-4" method="post">
          {accountHiddenFields}
          <input name="enableSSO" type="hidden" value={enableSSO ? "on" : ""} />

          {enableSSO ? (
            <>
              <Field label="Organisation name">
                <Input name="orgName" required />
              </Field>
              <Field label="Domain">
                <Input name="domain" placeholder="example.org" required />
              </Field>
              <Field label="Identity provider">
                <Select
                  name="providerId"
                  onValueChange={setProviderId}
                  options={IDP_PROVIDERS.map((p) => ({ label: p.label, value: p.id }))}
                  placeholder="Choose a provider"
                  value={providerId}
                />
              </Field>
              <Field hint="Shown on the sign-in screen." label="Display name (optional)">
                <Input name="ssoDisplayName" />
              </Field>

              {provider?.protocol === "oidc" ? (
                <fieldset className="flex flex-col gap-3 rounded-md border border-dashed border-border p-3">
                  <legend className="text-sm font-semibold text-ink">OIDC connection</legend>
                  <Field label="Issuer">
                    <Input name="issuer" placeholder="https://idp.example.org" />
                  </Field>
                  <Field label="Client ID">
                    <Input name="clientId" />
                  </Field>
                  <Field label="Client secret">
                    <Input autoComplete="off" name="clientSecret" type="password" />
                  </Field>
                </fieldset>
              ) : null}

              {provider && provider.protocol !== "oidc" ? (
                <fieldset className="flex flex-col gap-3 rounded-md border border-dashed border-border p-3">
                  <legend className="text-sm font-semibold text-ink">SAML connection</legend>
                  <Field label="Entity ID">
                    <Input name="entityId" placeholder="https://idp.example.org/metadata" />
                  </Field>
                  <Field label="SSO URL">
                    <Input name="ssoUrl" placeholder="https://idp.example.org/sso" />
                  </Field>
                  <Field label="IdP signing certificate">
                    <Textarea className="min-h-24 font-mono text-xs" name="signingCertificate" />
                  </Field>
                </fieldset>
              ) : null}

              <Banner title="Verification happens after DNS propagates" tone="info">
                We&apos;ll create the connection and start domain verification. You&apos;ll publish
                a DNS TXT record, then complete testing and activation from Admin -&gt; Setup.
              </Banner>
            </>
          ) : (
            <p className="text-sm text-muted">
              Local sign-in is always available for the root administrator you just created. You can
              enable organisation SSO at any time.
            </p>
          )}

          {serverError ? (
            <Banner title="Couldn't finish setup" tone="danger">
              {serverError}
            </Banner>
          ) : null}

          <div className="flex flex-col gap-2">
            {enableSSO ? (
              <>
                <Button type="submit">Finish setup</Button>
                <Button onClick={() => setEnableSSO(false)} type="button" variant="ghost">
                  Don&apos;t set up SSO
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEnableSSO(true)} type="button">
                  Set up SSO now
                </Button>
                <Button type="submit" variant="secondary">
                  Skip for now
                </Button>
              </>
            )}
          </div>
        </Form>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-sm gap-6 py-16">
      <h1 className="text-center text-xl font-semibold text-ink">First-run setup</h1>
      <p className="text-center text-sm text-muted">Create the root administrator account.</p>
      <form className="flex flex-col gap-4" noValidate onSubmit={handleAccountNext}>
        {clientError ? (
          <Banner title="Setup failed" tone="danger">
            {clientError}
          </Banner>
        ) : null}
        <Field label="Username">
          <Input
            autoComplete="off"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
            required
            value={username}
          />
        </Field>
        <Field label="Email">
          <Input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.org"
            required
            type="email"
            value={email}
          />
        </Field>
        <Field label="Display name">
          <Input
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </Field>
        <Field label="Password">
          <Input
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </Field>
        <Field label="Confirm password">
          <Input
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </Field>
        <Field label="Setup token">
          <Input
            autoComplete="off"
            className="font-mono text-sm"
            onChange={(event) => setSetupToken(event.target.value)}
            required
            type="password"
            value={setupToken}
          />
        </Field>
        <Button type="submit">Continue</Button>
      </form>
    </div>
  );
}
