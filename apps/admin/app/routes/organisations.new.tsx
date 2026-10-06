// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, PageHeader, Select, Textarea } from "@steward-web/ui";
import { useState } from "react";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/organisations.new";

import { buildIdpConfig } from "../organisations/idpConfig";
import { findProvider, IDP_PROVIDERS, type IdpProtocol } from "../organisations/idpProviders";
import { addOrganization } from "../organisations/organisations.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const orgName = String(form.get("orgName") ?? "").trim();
  const domain = String(form.get("domain") ?? "").trim();
  const providerId = String(form.get("providerId") ?? "");
  const displayName = String(form.get("displayName") ?? "").trim();
  const provider = findProvider(providerId);
  const protocol: IdpProtocol = provider?.protocol ?? "saml";

  if (!orgName || !domain || !provider) {
    return data(
      { ok: false, validationError: "A name, domain and identity provider are required." } as const,
      { status: 400 },
    );
  }

  const config = buildIdpConfig({
    clientId: String(form.get("clientId") ?? ""),
    entityId: String(form.get("entityId") ?? ""),
    issuer: String(form.get("issuer") ?? ""),
    protocol,
    signingCertificate: String(form.get("signingCertificate") ?? ""),
    ssoUrl: String(form.get("ssoUrl") ?? ""),
  });

  try {
    const created = await addOrganization(request, {
      config,
      displayName: displayName || undefined,
      domain,
      orgName,
      protocol,
      secretRef: String(form.get("clientSecret") ?? "") || undefined,
    });
    return redirect(`/organisations/${encodeURIComponent(created.domain)}`);
  } catch (error) {
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

export default function NewOrganisation({ actionData }: Route.ComponentProps) {
  const [providerId, setProviderId] = useState("");
  const provider = findProvider(providerId);

  return (
    <div className="flex w-full max-w-xl flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Access"
        subtitle="A SAML/OIDC connection is scoped to one domain. It needs domain ownership and a passing IdP login test before it can be activated."
        title="New organisation"
      />

      <Form className="flex flex-col gap-4" method="post">
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
          <Input name="displayName" />
        </Field>

        {provider ? (
          <Banner title={`Set up ${provider.label}`} tone="info">
            <ol className="ml-4 list-decimal space-y-1 text-sm">
              {provider.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Banner>
        ) : null}

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

        {actionData && !actionData.ok && "validationError" in actionData ? (
          <Banner title="Couldn't add this organisation" tone="danger">
            {actionData.validationError}
          </Banner>
        ) : null}
        {actionData && !actionData.ok && "failure" in actionData ? (
          <Banner
            failure={actionData.failure}
            title="Couldn't add this organisation"
            tone="danger"
          />
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit">Add organisation</Button>
          <Button asChild variant="secondary">
            <Link to="/organisations">Cancel</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}
