// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { Link } from "react-router";

import type { Route } from "./+types/organisations";

import { getSpCertificate, listOrganizations } from "../organisations/organisations.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [organisations, spCertificate] = await Promise.all([
    listOrganizations(request),
    getSpCertificate(request),
  ]);
  return { organisations, spCertificate };
};

export default function Organisations({ loaderData }: Route.ComponentProps) {
  const { organisations, spCertificate } = loaderData;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        actions={
          <Button asChild size="sm">
            <Link to="/organisations/new">New organisation</Link>
          </Button>
        }
        eyebrow="Access"
        subtitle="SAML/OIDC single sign-on connections, one per domain."
        title="Organisations"
      />

      {organisations.length === 0 ? (
        <EmptyState
          description="Add an organisation to connect a domain's SAML or OIDC identity provider."
          title="No organisations configured"
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Domain</TH>
              <TH>Organisation</TH>
              <TH>Protocol</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <tbody>
            {organisations.map((org) => (
              <tr key={org.domain}>
                <TD>
                  <Link
                    className="font-mono text-sm text-primary hover:underline"
                    to={`/organisations/${encodeURIComponent(org.domain)}`}
                  >
                    {org.domain}
                  </Link>
                </TD>
                <TD>{org.orgName}</TD>
                <TD>
                  <Badge tone="neutral">{org.protocol.toUpperCase()}</Badge>
                </TD>
                <TD>
                  <div className="flex flex-wrap items-center gap-1">
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
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* The platform SP certificate: one SAML SP certificate presented to every connected
          IdP, not per-organisation, so it lives here rather than on the manage page. */}
      <Card>
        <CardHeader>
          <CardTitle>SP certificate</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge tone={spCertificate.active ? "ok" : "neutral"}>
              {spCertificate.active ? "Active" : "Inactive"}
            </Badge>
            <span className="font-mono text-muted">{spCertificate.serial}</span>
          </div>
          <p className="text-muted">Expires {spCertificate.notAfter}.</p>
        </CardBody>
      </Card>
    </div>
  );
}
