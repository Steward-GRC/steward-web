// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { Badge, Card, CardBody, EmptyState, Input, PageHeader } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { listCategories, listPolicies } from "@steward-web/ui/domain/server";
import { type FormEvent, useState } from "react";
import { data, useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/search";

import { listGroups } from "../groups/groups.server";
import { buildSearchIndex, searchHits, type SearchHitType } from "../search/searchIndex";
import { listTemplates } from "../templates/templates.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [policies, categories, templates, groups] = await Promise.all([
    listPolicies(DocumentType.Policy, cookie),
    listCategories(cookie),
    // Templates and groups need `group.manage`; a caller without it still gets a usable
    // search over the policy library (the courtesy-degrade pattern this app already uses).
    listTemplates(request).catch(() => []),
    listGroups(request).catch(() => []),
  ]);
  return data({ categories, groups, policies, templates });
};

const GROUP_HEADING: Record<SearchHitType, string> = {
  Category: "Categories",
  Group: "Groups",
  Policy: "Policies",
  Template: "Templates",
};
const GROUP_ORDER: SearchHitType[] = ["Policy", "Category", "Template", "Group"];

export default function SearchRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [parameters, setParameters] = useSearchParams();
  const q = parameters.get("q") ?? "";
  const [input, setInput] = useState(q);

  // Keep the local input in sync when the URL query changes (the browser back button, or a
  // link with ?q= already set). Adjusting state during render on a prop change, not an
  // effect: track the last-seen URL query and reset the local input when it changes.
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setInput(q);
  }

  const index = buildSearchIndex(
    loaderData.policies,
    loaderData.categories,
    loaderData.templates,
    loaderData.groups,
  );
  const hits = searchHits(index, q);
  const groups = GROUP_ORDER.map((type) => ({
    heading: GROUP_HEADING[type],
    items: hits.filter((h) => h.type === type),
    type,
  })).filter((g) => g.items.length > 0);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = input.trim();
    setParameters(next ? { q: next } : {}, { replace: true });
  };

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Search"
        subtitle={
          q
            ? `${hits.length} result${hits.length === 1 ? "" : "s"} for "${q}"`
            : "Search across policies, templates and groups."
        }
        title="Search"
      />

      <form className="w-full" onSubmit={onSubmit}>
        <Input
          aria-label="Search"
          onChange={(event) => {
            setInput(event.target.value);
            const next = event.target.value.trim();
            setParameters(next ? { q: next } : {}, { replace: true });
          }}
          placeholder="Search policies, templates, groups…"
          type="search"
          value={input}
        />
      </form>

      <p className="text-xs text-muted">
        Operators: &quot;exact phrase&quot;, -exclude, OR, field:value (e.g. category:&quot;IT
        Security&quot; status:draft).
      </p>

      {q ? (
        groups.length === 0 ? (
          <EmptyState
            description={`Nothing matches "${q}". Try different terms or operators.`}
            title="No results"
          />
        ) : (
          groups.map((group) => (
            <section className="flex flex-col gap-3" key={group.type}>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {group.heading}
                </h2>
                <Badge tone="neutral">{group.items.length}</Badge>
              </div>
              <Card>
                <CardBody className="flex flex-col p-0">
                  {group.items.map((hit) => (
                    <button
                      className="flex flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-sunken"
                      key={`${group.type}-${hit.id}`}
                      onClick={() => navigate(hit.to)}
                      type="button"
                    >
                      <span className="text-sm font-medium text-ink">{hit.label}</span>
                      {hit.hint ? <span className="text-xs text-muted">{hit.hint}</span> : null}
                    </button>
                  ))}
                </CardBody>
              </Card>
            </section>
          ))
        )
      ) : (
        <EmptyState
          description="Start typing to search across policies, templates and groups."
          title="Search"
        />
      )}
    </div>
  );
}
