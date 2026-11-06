// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Badge, Banner, Button, Card, NotFound } from "@steward-web/ui";
import { useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/organisations.$domain";

import { listPlatformGroups } from "../groups/platformGroups.server";
import { ConnectionDetails } from "../organisations/ConnectionDetails";
import { DangerZone } from "../organisations/DangerZone";
import { DnsRecordCard } from "../organisations/DnsRecordCard";
import { GroupMappings } from "../organisations/GroupMappings";
import { IdpTestCard } from "../organisations/IdpTestCard";
import { LoginOptions } from "../organisations/LoginOptions";
import { failureOf, type OrgActionResult } from "../organisations/orgActionResult";
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
import { SETUP_STEPS, type SetupStep, SetupSteps } from "../organisations/SetupSteps";

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
      verification: null,
    };
  }

  const [mappings, groups, verification] = await Promise.all([
    listGroupMappings(request, org.connectionId),
    // Mappings point at identity's platform groups, not at categories.
    listPlatformGroups(request).catch(() => []),
    // Step 2's record: re-asking returns the same token until someone rotates it.
    org.verified
      ? Promise.resolve(null)
      : startDomainVerification(request, domain).catch(() => null),
  ]);

  return {
    canActivateNow: canActivate(org),
    canDeleteNow: canDelete(org),
    groupOptions: groups.map(({ id, path }) => ({ id, path })),
    mappings,
    organisation: org,
    verification,
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
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

/**
 * Organization setup (A24): a page, not a modal, so an admin can leave and come back. Until the
 * connection is active it's the four-step wizard (Details, Domain verification, IdP test,
 * Activate) opened at the first step not yet passed; once active it's a summary card with
 * "Reconfigure connection" and "Disable". Login options, group mappings and the danger zone sit
 * below either.
 */
export default function OrganizationSetup({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const org = loaderData.organisation;
  const state = useFetcher<OrgActionResult>();
  const [reconfiguring, setReconfiguring] = useState(false);
  const done = new Set<SetupStep>(
    org
      ? [
          "details",
          ...(org.verified ? (["domain"] as const) : []),
          ...(org.testPassed ? (["test"] as const) : []),
          ...(org.enabled ? (["activate"] as const) : []),
        ]
      : [],
  );
  const next = SETUP_STEPS.find((step) => !done.has(step)) ?? "details";
  const [chosen, setChosen] = useState<null | SetupStep>(null);
  const selected = chosen ?? next;

  if (!org) {
    return (
      <div className="flex w-full flex-col p-4 md:p-6">
        <NotFound
          action={
            <Button asChild variant="secondary">
              <Link to="/organisations">{t("organizations.setup.notFound.action")}</Link>
            </Button>
          }
          description={t("organizations.setup.notFound.description")}
          title={t("organizations.setup.notFound.title")}
        />
      </div>
    );
  }

  const { canActivateNow, canDeleteNow, groupOptions, mappings, verification } = loaderData;
  const locked = new Set<SetupStep>([
    ...(org.verified ? [] : (["test"] as const)),
    ...(canActivateNow || org.enabled ? [] : (["activate"] as const)),
  ]);
  const showSteps = !org.enabled || reconfiguring;

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header>
        <p className="text-xs font-medium text-muted">{t("organizations.setup.eyebrow")}</p>
        <h1 className="text-[26px] leading-[1.3] font-semibold">{org.domain}</h1>
        <p className="leading-normal text-muted">{t("organizations.setup.description")}</p>
      </header>

      {org.enabled ? (
        <Card aria-label={org.orgName} className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <b>{org.orgName}</b>
              <Badge tone="ok">{t("organizations.setup.summary.active")}</Badge>
            </div>
            <p className="text-sm text-muted">
              {t("organizations.setup.summary.summary", {
                displayName: org.displayName || org.orgName,
                protocol: org.protocol.toUpperCase(),
              })}
            </p>
          </div>
          <Button onClick={() => setReconfiguring((value) => !value)} variant="secondary">
            {t("organizations.setup.summary.reconfigure")}
          </Button>
          <Button
            busy={state.state !== "idle"}
            onClick={() => void state.submit({ intent: "disable" }, { method: "post" })}
            variant="secondary"
          >
            {t("organizations.setup.summary.disable")}
          </Button>
        </Card>
      ) : null}

      {showSteps ? (
        <>
          <SetupSteps done={done} locked={locked} onSelect={setChosen} selected={selected} />
          {selected === "details" ? <ConnectionDetails org={org} /> : null}
          {selected === "domain" ? (
            <>
              <DnsRecordCard verification={verification} verified={org.verified} />
              {org.verified ? (
                <Banner title={t("organizations.setup.dns.verified")} tone="ok" />
              ) : null}
            </>
          ) : null}
          {selected === "test" ? (
            <>
              {org.verified ? (
                <Banner title={t("organizations.setup.dns.verified")} tone="ok" />
              ) : null}
              <IdpTestCard org={org} />
            </>
          ) : null}
          {selected === "activate" ? (
            <Card className="flex flex-col gap-2.5 p-4">
              {org.testPassed ? (
                <Banner title={t("organizations.setup.test.passed")} tone="ok" />
              ) : null}
              <b>{t("organizations.setup.activate.title")}</b>
              <p className="text-sm text-muted">
                {canActivateNow || org.enabled
                  ? t("organizations.setup.activate.description", { domain: org.domain })
                  : t("organizations.setup.activate.locked")}
              </p>
              {org.enabled ? null : (
                <Button
                  busy={state.state !== "idle"}
                  className="self-start"
                  disabled={!canActivateNow}
                  onClick={() => void state.submit({ intent: "activate" }, { method: "post" })}
                >
                  {t("organizations.setup.activate.action")}
                </Button>
              )}
            </Card>
          ) : null}
        </>
      ) : null}
      {failureOf(state) ? (
        <Banner
          failure={failureOf(state)}
          title={t("organizations.setup.activate.failed")}
          tone="danger"
        />
      ) : null}

      <LoginOptions org={org} />
      <GroupMappings
        connectionId={org.connectionId}
        groupOptions={groupOptions}
        mappings={mappings}
      />
      <DangerZone canDelete={canDeleteNow} domain={org.domain} />
    </div>
  );
}
