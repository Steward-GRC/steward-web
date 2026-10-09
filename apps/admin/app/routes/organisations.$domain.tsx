// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Field,
  Input,
  PageHeader,
  Select,
  Switch,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { useEffect, useRef, useState } from "react";
import { data, Form, Link, redirect, useFetcher, useRevalidator } from "react-router";

import type { Route } from "./+types/organisations.$domain";

import { listGroups, orderedWithPaths } from "../groups/groups.server";
import {
  activateOrganization,
  addGroupMapping,
  canActivate,
  canDelete,
  changeOrgProtocol,
  deleteGroupMapping,
  deleteOrganization,
  disableOrganization,
  findOrganization,
  listGroupMappings,
  mintSsoTestLink,
  startDomainVerification,
  updateIdPConnection,
  verifyDomain,
} from "../organisations/organisations.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const domain = params.domain;
  const org = await findOrganization(request, domain);
  if (!org) {
    return {
      canActivateNow: false,
      canDeleteNow: false,
      groupOptions: [],
      mappings: [],
      organisation: null,
    };
  }

  const [mappings, groups] = await Promise.all([
    listGroupMappings(request, org.connectionId),
    listGroups(request).catch(() => []),
  ]);

  return {
    canActivateNow: canActivate(org),
    canDeleteNow: canDelete(org),
    groupOptions: orderedWithPaths(groups),
    mappings,
    organisation: org,
  };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const domain = params.domain;
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "activate": {
        await activateOrganization(request, domain);
        return data({ intent, ok: true } as const);
      }
      case "add-mapping": {
        const connectionId = String(form.get("connectionId") ?? "");
        const idpGroupClaimValue = String(form.get("idpGroupClaimValue") ?? "").trim();
        const targetGroupId = String(form.get("targetGroupId") ?? "");
        if (!idpGroupClaimValue || !targetGroupId) {
          return data(
            {
              intent,
              ok: false,
              validationError: "A claim value and a target group are required.",
            } as const,
            { status: 400 },
          );
        }
        await addGroupMapping(request, connectionId, idpGroupClaimValue, targetGroupId);
        return data({ intent, ok: true } as const);
      }
      case "change-protocol": {
        const protocol = String(form.get("protocol") ?? "");
        if (protocol !== "saml" && protocol !== "oidc") {
          return data({ intent, ok: false, validationError: "Choose a protocol." } as const, {
            status: 400,
          });
        }
        await changeOrgProtocol(request, domain, protocol);
        return data({ intent, ok: true } as const);
      }
      case "delete": {
        await deleteOrganization(request, domain);
        return redirect("/organisations");
      }
      case "delete-mapping": {
        await deleteGroupMapping(request, String(form.get("mappingId") ?? ""));
        return data({ intent, ok: true } as const);
      }
      case "disable": {
        await disableOrganization(request, domain);
        return data({ intent, ok: true } as const);
      }
      case "mint-test-link": {
        const org = await findOrganization(request, domain);
        if (!org) throw data("organisation not found", { status: 404 });
        const link = await mintSsoTestLink(request, {
          alias: org.connectionAlias,
          connectionId: org.connectionId,
          returnPath: new URL(request.url).pathname,
          tenant: org.domain,
        });
        return data({ intent, link, ok: true } as const);
      }
      case "rotate-verification": {
        const verification = await startDomainVerification(request, domain, true);
        return data({ intent, ok: true, verification } as const);
      }
      case "set-client-secret": {
        const clientSecret = String(form.get("clientSecret") ?? "");
        if (!clientSecret.trim()) {
          return data({ intent, ok: false, validationError: "Enter the client secret." } as const, {
            status: 400,
          });
        }
        await updateIdPConnection(request, domain, { clientSecret });
        return data({ intent, ok: true } as const);
      }
      case "start-verification": {
        const verification = await startDomainVerification(request, domain);
        return data({ intent, ok: true, verification } as const);
      }
      case "update-toggles": {
        await updateIdPConnection(request, domain, {
          allowLocal: form.get("allowLocal") === "on",
          jitEnabled: form.get("jitEnabled") === "on",
        });
        return data({ intent, ok: true } as const);
      }
      case "verify-domain": {
        await verifyDomain(request, domain);
        return data({ intent, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ failure: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

export default function OrganisationManage({ actionData, loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  // "Copy test link" mints the link through this route's own action (a server-side call,
  // same as every other mutation here) and copies the result once it lands. Applying it
  // during render (mirroring the fetcher's data into pendingCopyUrl) rather than in an
  // effect body keeps the clipboard write itself — a real external side effect — as the
  // only thing the effect below does.
  const copyLinkFetcher = useFetcher<typeof action>();
  const [appliedCopyLink, setAppliedCopyLink] = useState(copyLinkFetcher.data);
  const [pendingCopyUrl, setPendingCopyUrl] = useState<null | string>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  if (copyLinkFetcher.data !== appliedCopyLink) {
    setAppliedCopyLink(copyLinkFetcher.data);
    if (copyLinkFetcher.data?.ok && "link" in copyLinkFetcher.data) {
      setPendingCopyUrl(copyLinkFetcher.data.link.url);
    }
  }
  useEffect(() => {
    if (!pendingCopyUrl) return;
    void navigator.clipboard.writeText(pendingCopyUrl).then(() => {
      setPendingCopyUrl(null);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [pendingCopyUrl]);

  // "Run IdP test" opens a popup pointed at /resources/sso-test-link (see that route): the
  // mint happens server-side, behind a same-origin redirect the popup blocker already
  // allowed, landing the popup on the gateway's own test-start URL. The gateway's callback
  // page posts the result back to window.opener and closes the popup; the closed-poll
  // here covers a popup closed without a message (dismissed, or blocked outright, in
  // which case the click handler falls back to a same-tab redirect instead).
  const [testPending, setTestPending] = useState(false);
  const testPopupRef = useRef<null | Window>(null);
  useEffect(() => {
    if (!testPending) return;
    const popup = testPopupRef.current;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== globalThis.location.origin) return;
      const message = event.data as { success?: boolean; type?: string } | null;
      if (message?.type !== "idp-test-result") return;
      try {
        popup?.close();
      } catch {
        /* popup already closed, or cross-origin by the time it fires */
      }
      setTestPending(false);
      void revalidator.revalidate();
    };
    window.addEventListener("message", onMessage);
    const closedPoll = globalThis.setInterval(() => {
      if (popup && popup.closed) {
        setTestPending(false);
        void revalidator.revalidate();
      }
    }, 500);
    return () => {
      window.removeEventListener("message", onMessage);
      globalThis.clearInterval(closedPoll);
    };
    // revalidator is stable; testPopupRef is read once per pending window, not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testPending]);

  if (!loaderData.organisation) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          eyebrow="Access"
          subtitle="No organisation matches that domain."
          title="Organisation not found"
        />
        <Button asChild className="self-start" variant="secondary">
          <Link to="/organisations">Back to organisations</Link>
        </Button>
      </div>
    );
  }

  const { canActivateNow, canDeleteNow, groupOptions, mappings, organisation: org } = loaderData;

  const ssoTestUrl = `/resources/sso-test-link?${new URLSearchParams({
    alias: org.connectionAlias,
    connectionId: org.connectionId,
    returnPath: `/organisations/${encodeURIComponent(org.domain)}`,
    tenant: org.domain,
  }).toString()}`;

  const errorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "failure" in actionData
      ? actionData.failure
      : undefined;
  const validationErrorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "validationError" in actionData
      ? actionData.validationError
      : undefined;
  const savedIntent = actionData?.ok ? actionData.intent : undefined;
  const verification =
    actionData?.ok && "verification" in actionData ? actionData.verification : undefined;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader eyebrow="Access" subtitle={org.domain} title={org.orgName} />

      <Tabs defaultValue="activation">
        <TabsList>
          <TabsTrigger value="activation">Activation</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="mappings">Group mappings</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col gap-6" value="activation">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={org.verified ? "ok" : "neutral"}>
              {org.verified ? "Verified" : "Not verified"}
            </Badge>
            <Badge tone={org.testPassed ? "ok" : "neutral"}>
              {org.testPassed ? "Tested" : "Not tested"}
            </Badge>
            <Badge tone={org.enabled ? "primary" : "danger"}>
              {org.enabled ? "Active" : "Disabled"}
            </Badge>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6">
            <p className="text-sm font-semibold text-ink">Domain verification</p>
            <p className="text-sm text-muted">
              Publish the DNS TXT record below for {org.domain}, then verify.
            </p>
            {verification ? (
              <div className="flex flex-col gap-1 rounded-md border border-dashed border-border p-3 font-mono text-xs">
                <span>{verification.dnsRecordName}</span>
                <span>{verification.dnsRecordValue}</span>
              </div>
            ) : null}
            {errorFor("start-verification") ||
            errorFor("rotate-verification") ||
            errorFor("verify-domain") ? (
              <Banner
                failure={
                  errorFor("start-verification") ??
                  errorFor("rotate-verification") ??
                  errorFor("verify-domain")
                }
                title="Couldn't update domain verification"
                tone="danger"
              />
            ) : null}
            <div className="flex items-center gap-2">
              <Form method="post">
                <input name="intent" type="hidden" value="start-verification" />
                <Button type="submit" variant="secondary">
                  Get verification record
                </Button>
              </Form>
              <Form method="post">
                <input name="intent" type="hidden" value="verify-domain" />
                <Button type="submit" variant="secondary">
                  Verify domain
                </Button>
              </Form>
              <Form method="post">
                <input name="intent" type="hidden" value="rotate-verification" />
                <Button type="submit" variant="secondary">
                  Rotate token
                </Button>
              </Form>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6">
            <p className="text-sm font-semibold text-ink">IdP test</p>
            {org.verified ? (
              <>
                <p className="text-sm text-muted">
                  Runs a full sign-in against the connected IdP in a new window. Complete the
                  sign-in there — the result returns here automatically.
                </p>
                {copyLinkFetcher.data &&
                !copyLinkFetcher.data.ok &&
                "failure" in copyLinkFetcher.data ? (
                  <Banner
                    failure={copyLinkFetcher.data.failure}
                    title="Couldn't create a test link"
                    tone="danger"
                  />
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    disabled={testPending}
                    onClick={() => {
                      const popup = window.open(ssoTestUrl, "idp-test", "width=520,height=680");
                      if (!popup) {
                        globalThis.location.assign(ssoTestUrl);
                        return;
                      }
                      testPopupRef.current = popup;
                      setTestPending(true);
                    }}
                    type="button"
                  >
                    {testPending ? "Testing…" : org.testPassed ? "Run test again" : "Run IdP test"}
                  </Button>
                  <Button
                    disabled={copyLinkFetcher.state !== "idle"}
                    onClick={() => {
                      const form = new FormData();
                      form.set("intent", "mint-test-link");
                      void copyLinkFetcher.submit(form, { method: "post" });
                    }}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {linkCopied
                      ? "Copied"
                      : copyLinkFetcher.state === "idle"
                        ? "Copy test link"
                        : "Creating…"}
                  </Button>
                </div>
                <p className="text-xs text-muted">
                  Onboarding another organisation&apos;s domain? Copy a scoped, time-bound link and
                  hand it to a user at that organisation to run the test instead — the result still
                  records back here.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Verify the domain first.</p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6">
            {errorFor("activate") || errorFor("disable") ? (
              <Banner
                failure={errorFor("activate") ?? errorFor("disable")}
                title="Couldn't change the connection's state"
                tone="danger"
              />
            ) : null}
            <Form method="post">
              <input name="intent" type="hidden" value={org.enabled ? "disable" : "activate"} />
              <Button disabled={!org.enabled && !canActivateNow} type="submit">
                {org.enabled ? "Disable" : "Activate"}
              </Button>
            </Form>
            {savedIntent === "activate" || savedIntent === "disable" ? (
              <p className="text-sm text-ok">Saved.</p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="connection">
          <Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="update-toggles" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">Just-in-time provisioning</p>
                <p className="text-sm text-muted">
                  An unknown SSO email is auto-provisioned on first sign-in.
                </p>
              </div>
              <Switch defaultChecked={org.jitEnabled} name="jitEnabled" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">Allow local password login</p>
                <p className="text-sm text-muted">
                  Lets this organisation&apos;s users also sign in with a local password.
                </p>
              </div>
              <Switch defaultChecked={org.allowLocal} name="allowLocal" />
            </div>
            {errorFor("update-toggles") ? (
              <Banner
                failure={errorFor("update-toggles")}
                title="Couldn't save these toggles"
                tone="danger"
              />
            ) : null}
            <Button className="self-start" type="submit">
              Save
            </Button>
            {savedIntent === "update-toggles" ? <p className="text-sm text-ok">Saved.</p> : null}
          </Form>

          {org.protocol === "oidc" ? (
            <Form className="flex flex-col gap-3 border-t border-border pt-6" method="post">
              <input name="intent" type="hidden" value="set-client-secret" />
              {org.secretReentryRequired ? (
                <Banner title="Enter the client secret again" tone="warn">
                  The stored client secret reference was cleared because it wasn&apos;t a key
                  reference. Sign-in still works; enter the secret again to keep it on record.
                </Banner>
              ) : null}
              <Field
                hint="Write-only: it's stored outside the database and never shown again."
                label="Client secret"
              >
                <Input autoComplete="off" name="clientSecret" type="password" />
              </Field>
              {validationErrorFor("set-client-secret") ? (
                <Banner title="Couldn't replace the client secret" tone="danger">
                  {validationErrorFor("set-client-secret")}
                </Banner>
              ) : null}
              {errorFor("set-client-secret") ? (
                <Banner
                  failure={errorFor("set-client-secret")}
                  title="Couldn't replace the client secret"
                  tone="danger"
                />
              ) : null}
              <Button className="self-start" type="submit" variant="secondary">
                Replace client secret
              </Button>
              {savedIntent === "set-client-secret" ? (
                <p className="text-sm text-ok">Client secret replaced.</p>
              ) : null}
            </Form>
          ) : null}

          <Form className="flex flex-col gap-3 border-t border-border pt-6" method="post">
            <input name="intent" type="hidden" value="change-protocol" />
            <Field
              hint="Destructive: it resets this connection to the start, clearing both gates and disabling it."
              label="Identity provider protocol"
            >
              <Select
                defaultValue={org.protocol}
                name="protocol"
                options={[
                  { label: "SAML", value: "saml" },
                  { label: "OIDC", value: "oidc" },
                ]}
              />
            </Field>
            {validationErrorFor("change-protocol") ? (
              <Banner title="Couldn't change the protocol" tone="danger">
                {validationErrorFor("change-protocol")}
              </Banner>
            ) : null}
            {errorFor("change-protocol") ? (
              <Banner
                failure={errorFor("change-protocol")}
                title="Couldn't change the protocol"
                tone="danger"
              />
            ) : null}
            <Button className="self-start" type="submit" variant="secondary">
              Change protocol
            </Button>
            {savedIntent === "change-protocol" ? <p className="text-sm text-ok">Changed.</p> : null}
          </Form>
        </TabsContent>

        <TabsContent className="flex flex-col gap-6" value="mappings">
          {mappings.length === 0 ? (
            <p className="text-sm text-muted">No group mappings yet.</p>
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>IdP group claim</TH>
                  <TH>Platform group</TH>
                  <TH />
                </tr>
              </THead>
              <tbody>
                {mappings.map((mapping) => (
                  <tr key={mapping.id}>
                    <TD>{mapping.idpGroupClaimValue}</TD>
                    <TD>
                      {groupOptions.find((g) => g.id === mapping.targetGroupId)?.path ??
                        mapping.targetGroupId}
                    </TD>
                    <TD>
                      <Form method="post">
                        <input name="intent" type="hidden" value="delete-mapping" />
                        <input name="mappingId" type="hidden" value={mapping.id} />
                        <Button size="sm" type="submit" variant="secondary">
                          Remove
                        </Button>
                      </Form>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Form className="flex flex-col gap-4 border-t border-border pt-6" method="post">
            <input name="intent" type="hidden" value="add-mapping" />
            <input name="connectionId" type="hidden" value={org.connectionId} />
            <Field label="IdP group claim value">
              <Input name="idpGroupClaimValue" required />
            </Field>
            <Field label="Platform group">
              <Select
                name="targetGroupId"
                options={groupOptions.map((g) => ({ label: g.path, value: g.id }))}
                placeholder="Choose a group"
              />
            </Field>
            {validationErrorFor("add-mapping") ? (
              <Banner title="Couldn't add this mapping" tone="danger">
                {validationErrorFor("add-mapping")}
              </Banner>
            ) : null}
            {errorFor("add-mapping") ? (
              <Banner
                failure={errorFor("add-mapping")}
                title="Couldn't add this mapping"
                tone="danger"
              />
            ) : null}
            <Button className="self-start" type="submit">
              Add mapping
            </Button>
          </Form>
        </TabsContent>

        <TabsContent className="flex flex-col gap-4" value="danger">
          <p className="text-sm font-semibold text-danger">Delete this organisation</p>
          <p className="text-sm text-muted">
            Users on {org.domain} will no longer be able to sign in via SSO. This can&apos;t be
            undone. {canDeleteNow ? null : "Disable the connection first."}
          </p>
          {errorFor("delete") ? (
            <Banner
              failure={errorFor("delete")}
              title="Couldn't delete this organisation"
              tone="danger"
            />
          ) : null}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="self-start" disabled={!canDeleteNow} variant="danger">
                Delete organisation...
              </Button>
            </DialogTrigger>
            <DialogContent description="This can't be undone." title={`Delete ${org.orgName}?`}>
              <Form method="post">
                <input name="intent" type="hidden" value="delete" />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" variant="danger">
                    Delete organisation
                  </Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
