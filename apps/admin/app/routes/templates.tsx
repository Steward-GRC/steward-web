// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Button, EmptyState, PageHeader, Table, TD, TH, THead } from "@steward-web/ui";
import { Link } from "react-router";

import type { Route } from "./+types/templates";

import { listGroups } from "../groups/groups.server";
import { listTemplates, listTemplateVersions } from "../templates/templates.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [templates, groups] = await Promise.all([
    listTemplates(request),
    // The owning category name is a courtesy label, not a gate: a caller who can manage
    // templates but not groups still gets the page, just without category names.
    listGroups(request).catch(() => []),
  ]);
  const rows = await Promise.all(
    templates.map(async (template) => {
      const versions = await listTemplateVersions(request, template.id);
      return {
        categoryName: groups.find((g) => g.id === template.ownerCategoryId)?.name ?? null,
        latestStatus: versions[0]?.status ?? null,
        template,
        versionCount: versions.length,
      };
    }),
  );
  return { rows };
};

export default function Templates({ loaderData }: Route.ComponentProps) {
  const { rows } = loaderData;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        actions={
          <Button asChild size="sm">
            <Link to="/templates/new">New template</Link>
          </Button>
        }
        eyebrow="Structure"
        subtitle="Reusable document skeletons."
        title="Templates"
      />

      {rows.length === 0 ? (
        <EmptyState
          action={
            <Button asChild size="sm">
              <Link to="/templates/new">New template</Link>
            </Button>
          }
          description="Create the first template to start building reusable document structures."
          title="No templates yet"
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Template</TH>
              <TH>Category</TH>
              <TH>Versions</TH>
              <TH>Latest</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map(({ categoryName, latestStatus, template, versionCount }) => (
              <tr key={template.id}>
                <TD>
                  <Link
                    className="font-medium text-primary hover:underline"
                    to={`/templates/${template.code}`}
                  >
                    {template.name}
                  </Link>
                  {template.retiredAt ? (
                    <Badge className="ml-2" tone="neutral">
                      Retired
                    </Badge>
                  ) : null}
                </TD>
                <TD>{categoryName ?? <span className="text-muted">—</span>}</TD>
                <TD>
                  <Badge tone="neutral">{versionCount}</Badge>
                </TD>
                <TD>
                  {latestStatus ? (
                    <Badge tone={latestStatus === "published" ? "ok" : "neutral"}>
                      {latestStatus}
                    </Badge>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
