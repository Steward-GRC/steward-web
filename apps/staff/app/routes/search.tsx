// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { DocumentType } from "@steward-web/ui/domain";
import { listCategories, listPolicies } from "@steward-web/ui/domain/server";
import { Badge, Card, CardBody, EmptyState, Input, PageHeader } from "@steward-web/ui";
import { Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { data, useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/search";

import { type SearchHitType, buildSearchIndex, searchHits } from "../search/searchIndex";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [policies, categories] = await Promise.all([
    listPolicies(DocumentType.Policy, cookie),
    listCategories(cookie),
  ]);
  return data({ categories, policies });
};

const GROUP_HEADING: Record<SearchHitType, string> = {
  Category: "Categories",
  Policy: "Policies",
};
const GROUP_ORDER: SearchHitType[] = ["Policy", "Category"];

export default function SearchRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("search");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);

  // Keep the local input in sync when the URL query changes (the browser back button, or a
  // link with ?q= already set). Adjusting state during render on a prop change, not an
  // effect: track the last-seen URL query and reset the local input when it changes.
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setInput(q);
  }

  const index = buildSearchIndex(loaderData.policies, loaderData.categories);
  const hits = searchHits(index, q);
  const groups = GROUP_ORDER.map((type) => ({
    heading: GROUP_HEADING[type],
    items: hits.filter((h) => h.type === type),
    type,
  })).filter((g) => g.items.length > 0);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = input.trim();
    setParams(next ? { q: next } : {}, { replace: true });
  };

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow={t("eyebrow")}
        subtitle={
          q ? t("subtitleResults", { count: hits.length, query: q }) : t("subtitleEmpty")
        }
        title={t("title")}
      />

      <form className="relative w-full" onSubmit={onSubmit}>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
        <Input
          aria-label={t("title")}
          autoFocus
          className="pl-8"
          onChange={(e) => {
            setInput(e.target.value);
            const next = e.target.value.trim();
            setParams(next ? { q: next } : {}, { replace: true });
          }}
          placeholder={t("placeholder")}
          type="search"
          value={input}
        />
      </form>

      <p className="text-xs text-muted">{t("operatorsHint")}</p>

      {!q ? (
        <EmptyState description={t("start.description")} title={t("start.title")} />
      ) : groups.length === 0 ? (
        <EmptyState description={t("noResults.description", { query: q })} title={t("noResults.title")} />
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
      )}
    </div>
  );
}
