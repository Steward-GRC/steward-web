// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { Button, Card, CardBody, Input, Table, TD, TH, THead } from "@steward-web/ui";
import { useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/drafts";

import { listMyDraftPolicies } from "../authoring/authoring.server";
import { filterDrafts, sortDraftsByRecent, visibleDrafts } from "../authoring/myDrafts";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const drafts = await listMyDraftPolicies(request);
  return { drafts };
};

export default function Drafts({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const matching = filterDrafts(sortDraftsByRecent(loaderData.drafts), query);
  const visible = visibleDrafts(matching, expanded || query.trim() !== "");

  return (
    <div className="grid gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold text-ink">{t("drafts.title")}</h1>
          <p className="text-sm text-muted">{t("drafts.subtitle")}</p>
        </div>
        <Button asChild>
          <Link to="/drafts/new">{t("drafts.new")}</Link>
        </Button>
      </div>

      <Input
        aria-label={t("drafts.search")}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("drafts.search")}
        value={query}
      />

      {matching.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">{t("drafts.empty.description")}</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <TH>{t("drafts.table.number")}</TH>
                <TH>{t("drafts.table.title")}</TH>
                <TH>{t("drafts.table.updated")}</TH>
              </tr>
            </THead>
            <tbody>
              {visible.map((draft) => (
                <tr key={draft.id}>
                  <TD className="font-mono text-sm">{draft.number || "—"}</TD>
                  <TD>
                    <Link
                      className="font-medium text-ink hover:underline"
                      to={`/drafts/${draft.id}`}
                    >
                      {draft.title}
                    </Link>
                  </TD>
                  <TD>{draft.updated}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
          {!expanded && query.trim() === "" && matching.length > visible.length ? (
            <Button onClick={() => setExpanded(true)} variant="secondary">
              {t("drafts.showAll", { count: matching.length })}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
