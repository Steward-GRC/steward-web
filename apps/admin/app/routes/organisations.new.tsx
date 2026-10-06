// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, PageHeader, Select, Textarea } from "@steward-web/ui";
import { useState } from "react";
import { data, Form, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/organisations.new";
import type { action as idpMetadataAction } from "./resources.idp-metadata";

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

  // SAML fields are controlled so a metadata import (by URL or an uploaded file) can
  // prefill them; displayName is controlled too since an import can set it.
  const [displayName, setDisplayName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [ssoUrl, setSsoUrl] = useState("");
  const [signingCertificate, setSigningCertificate] = useState("");

  const applyMetadata = (metadata: {
    displayName: string;
    entityId: string;
    signingCertificate: string;
    ssoUrl: string;
  }) => {
    setEntityId(metadata.entityId);
    setSsoUrl(metadata.ssoUrl);
    setSigningCertificate(metadata.signingCertificate);
    if (metadata.displayName) setDisplayName(metadata.displayName);
  };

  const [metadataUrl, setMetadataUrl] = useState("");
  const importFetcher = useFetcher<typeof idpMetadataAction>();
  // Applies a fresh result the moment it lands, during render rather than in an effect
  // (React's own "adjusting state when a prop changes" pattern): appliedImport mirrors
  // the last fetcher.data this component has seen, so the body only runs once per result.
  const [appliedImport, setAppliedImport] = useState(importFetcher.data);
  if (importFetcher.data !== appliedImport) {
    setAppliedImport(importFetcher.data);
    if (importFetcher.data?.ok && importFetcher.data.intent === "import-url") {
      applyMetadata(importFetcher.data.metadata);
    }
  }

  const fileFetcher = useFetcher<typeof idpMetadataAction>();
  const [appliedFile, setAppliedFile] = useState(fileFetcher.data);
  if (fileFetcher.data !== appliedFile) {
    setAppliedFile(fileFetcher.data);
    if (fileFetcher.data?.ok && fileFetcher.data.intent === "parse-file") {
      applyMetadata(fileFetcher.data.metadata);
    }
  }
  const handleMetadataFile = (file: File | undefined) => {
    if (!file) return;
    const form = new FormData();
    form.set("intent", "parse-file");
    form.set("metadata", file);
    void fileFetcher.submit(form, { action: "/resources/idp-metadata", method: "post" });
  };

  const [certUrl, setCertUrl] = useState("");
  const certFetcher = useFetcher<typeof idpMetadataAction>();
  const [appliedCert, setAppliedCert] = useState(certFetcher.data);
  if (certFetcher.data !== appliedCert) {
    setAppliedCert(certFetcher.data);
    if (certFetcher.data?.ok && certFetcher.data.intent === "fetch-cert") {
      setSigningCertificate(certFetcher.data.certificatePem);
    }
  }

  const metadataFailure = (fetcher: typeof fileFetcher | typeof importFetcher) =>
    fetcher.data && !fetcher.data.ok ? fetcher.data.failure : undefined;

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
          <Input
            name="displayName"
            onChange={(event) => setDisplayName(event.currentTarget.value)}
            value={displayName}
          />
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

            <Field
              hint="Fetches the IdP's published SAML metadata and fills in the fields below."
              label="Import metadata from a URL"
            >
              <div className="flex gap-2">
                <Input
                  onChange={(event) => setMetadataUrl(event.currentTarget.value)}
                  placeholder="https://idp.example.org/metadata"
                  value={metadataUrl}
                />
                <Button
                  disabled={importFetcher.state !== "idle" || !metadataUrl.trim()}
                  onClick={() => {
                    const form = new FormData();
                    form.set("intent", "import-url");
                    form.set("url", metadataUrl.trim());
                    void importFetcher.submit(form, {
                      action: "/resources/idp-metadata",
                      method: "post",
                    });
                  }}
                  type="button"
                  variant="secondary"
                >
                  {importFetcher.state === "idle" ? "Import" : "Importing…"}
                </Button>
              </div>
            </Field>
            {metadataFailure(importFetcher) ? (
              <Banner
                failure={metadataFailure(importFetcher)}
                title="Couldn't import metadata from that URL"
                tone="danger"
              />
            ) : null}

            <Field
              hint="Or upload the metadata file your IdP offers for download."
              label="Import metadata from a file"
            >
              <Input
                accept=".xml,text/xml,application/xml,application/samlmetadata+xml"
                onChange={(event) => handleMetadataFile(event.currentTarget.files?.[0])}
                type="file"
              />
            </Field>
            {metadataFailure(fileFetcher) ? (
              <Banner
                failure={metadataFailure(fileFetcher)}
                title="Couldn't parse that metadata file"
                tone="danger"
              />
            ) : null}

            <Field label="Entity ID">
              <Input
                name="entityId"
                onChange={(event) => setEntityId(event.currentTarget.value)}
                placeholder="https://idp.example.org/metadata"
                value={entityId}
              />
            </Field>
            <Field label="SSO URL">
              <Input
                name="ssoUrl"
                onChange={(event) => setSsoUrl(event.currentTarget.value)}
                placeholder="https://idp.example.org/sso"
                value={ssoUrl}
              />
            </Field>
            <Field label="IdP signing certificate">
              <Textarea
                className="min-h-24 font-mono text-xs"
                name="signingCertificate"
                onChange={(event) => setSigningCertificate(event.currentTarget.value)}
                value={signingCertificate}
              />
            </Field>
            <Field
              hint="Fetch just the signing certificate, if your IdP doesn't publish full metadata."
              label="Fetch certificate from a URL"
            >
              <div className="flex gap-2">
                <Input
                  onChange={(event) => setCertUrl(event.currentTarget.value)}
                  placeholder="https://idp.example.org/cert"
                  value={certUrl}
                />
                <Button
                  disabled={certFetcher.state !== "idle" || !certUrl.trim()}
                  onClick={() => {
                    const form = new FormData();
                    form.set("intent", "fetch-cert");
                    form.set("url", certUrl.trim());
                    void certFetcher.submit(form, {
                      action: "/resources/idp-metadata",
                      method: "post",
                    });
                  }}
                  type="button"
                  variant="secondary"
                >
                  {certFetcher.state === "idle" ? "Fetch" : "Fetching…"}
                </Button>
              </div>
            </Field>
            {certFetcher.data && !certFetcher.data.ok ? (
              <Banner
                failure={certFetcher.data.failure}
                title="Couldn't fetch a certificate from that URL"
                tone="danger"
              />
            ) : null}
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
