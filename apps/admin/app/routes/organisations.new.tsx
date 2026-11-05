// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, Select, Textarea } from "@steward-web/ui";
import { useState } from "react";
import { data, Form, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/organisations.new";
import type { action as idpMetadataAction } from "./resources.idp-metadata";

import { buildIdpConfig, clientSecretInput } from "../organisations/idpConfig";
import { findProvider, IDP_PROVIDERS, type IdpProtocol } from "../organisations/idpProviders";
import { addOrganization } from "../organisations/organisations.server";
import { SetupSteps } from "../organisations/SetupSteps";

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
      ...clientSecretInput(protocol, String(form.get("clientSecret") ?? "")),
    });
    return redirect(`/organisations/${encodeURIComponent(created.domain)}`);
  } catch (error) {
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

/** A24 step 1, Details: the connection's name, domain and identity provider, before the gates. */
export default function NewOrganisation({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
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
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header>
        <p className="text-xs font-medium text-muted">{t("organizations.setup.eyebrow")}</p>
        <h1 className="text-[26px] leading-[1.3] font-semibold">{t("organizations.add.title")}</h1>
        <p className="leading-normal text-muted">{t("organizations.setup.description")}</p>
      </header>
      <SetupSteps
        done={new Set()}
        locked={new Set(["activate", "domain", "test"])}
        onSelect={() => {}}
        selected="details"
      />

      <Form
        aria-label={t("organizations.add.card")}
        className="flex flex-col gap-4 rounded-[10px] border border-border bg-surface p-4"
        method="post"
      >
        <Field label={t("organizations.add.orgName")}>
          <Input name="orgName" required />
        </Field>
        <Field label={t("organizations.add.domain")}>
          <Input name="domain" placeholder="example.org" required />
        </Field>
        <Field label={t("organizations.add.provider")}>
          <Select
            name="providerId"
            onValueChange={setProviderId}
            options={IDP_PROVIDERS.map((p) => ({ label: p.label, value: p.id }))}
            placeholder={t("organizations.add.choose")}
            value={providerId}
          />
        </Field>
        <Field
          hint={t("organizations.add.displayNameHint")}
          label={t("organizations.add.displayName")}
        >
          <Input
            name="displayName"
            onChange={(event) => setDisplayName(event.currentTarget.value)}
            value={displayName}
          />
        </Field>

        {provider ? (
          <Banner title={t("organizations.add.setUp", { provider: provider.label })} tone="info">
            <ol className="ml-4 list-decimal space-y-1 text-sm">
              {provider.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Banner>
        ) : null}

        {provider?.protocol === "oidc" ? (
          <fieldset className="flex flex-col gap-3 rounded-md border border-dashed border-border p-3">
            <legend className="text-sm font-semibold text-ink">
              {t("organizations.add.oidc")}
            </legend>
            <Field label={t("organizations.add.issuer")}>
              <Input name="issuer" placeholder="https://idp.example.org" />
            </Field>
            <Field label={t("organizations.add.clientId")}>
              <Input name="clientId" />
            </Field>
            <Field label={t("organizations.add.clientSecret")}>
              <Input autoComplete="off" name="clientSecret" type="password" />
            </Field>
          </fieldset>
        ) : null}

        {provider && provider.protocol !== "oidc" ? (
          <fieldset className="flex flex-col gap-3 rounded-md border border-dashed border-border p-3">
            <legend className="text-sm font-semibold text-ink">
              {t("organizations.add.saml")}
            </legend>

            <Field
              hint={t("organizations.add.importUrlHint")}
              label={t("organizations.add.importUrl")}
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
                  {importFetcher.state === "idle"
                    ? t("organizations.add.import")
                    : t("organizations.add.importing")}
                </Button>
              </div>
            </Field>
            {metadataFailure(importFetcher) ? (
              <Banner
                failure={metadataFailure(importFetcher)}
                title={t("organizations.add.importFailed")}
                tone="danger"
              />
            ) : null}

            <Field
              hint={t("organizations.add.importFileHint")}
              label={t("organizations.add.importFile")}
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
                title={t("organizations.add.fileFailed")}
                tone="danger"
              />
            ) : null}

            <Field label={t("organizations.add.entityId")}>
              <Input
                name="entityId"
                onChange={(event) => setEntityId(event.currentTarget.value)}
                placeholder="https://idp.example.org/metadata"
                value={entityId}
              />
            </Field>
            <Field label={t("organizations.add.ssoUrl")}>
              <Input
                name="ssoUrl"
                onChange={(event) => setSsoUrl(event.currentTarget.value)}
                placeholder="https://idp.example.org/sso"
                value={ssoUrl}
              />
            </Field>
            <Field label={t("organizations.add.certificate")}>
              <Textarea
                className="min-h-24 font-mono text-xs"
                name="signingCertificate"
                onChange={(event) => setSigningCertificate(event.currentTarget.value)}
                value={signingCertificate}
              />
            </Field>
            <Field hint={t("organizations.add.certUrlHint")} label={t("organizations.add.certUrl")}>
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
                  {certFetcher.state === "idle"
                    ? t("organizations.add.fetch")
                    : t("organizations.add.fetching")}
                </Button>
              </div>
            </Field>
            {certFetcher.data && !certFetcher.data.ok ? (
              <Banner
                failure={certFetcher.data.failure}
                title={t("organizations.add.certFailed")}
                tone="danger"
              />
            ) : null}
          </fieldset>
        ) : null}

        {actionData && !actionData.ok && "validationError" in actionData ? (
          <Banner title={t("organizations.add.failed")} tone="danger">
            {t("organizations.add.required")}
          </Banner>
        ) : null}
        {actionData && !actionData.ok && "failure" in actionData ? (
          <Banner
            failure={actionData.failure}
            title={t("organizations.add.failed")}
            tone="danger"
          />
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit">{t("organizations.add.submit")}</Button>
          <Button asChild variant="secondary">
            <Link to="/organisations">{t("organizations.add.cancel")}</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}
