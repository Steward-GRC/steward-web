// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { type CommandPaletteResults, refusalOf } from "@steward-web/shell";
import { PageHeader, ReachError } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { listCategories, listPolicies } from "@steward-web/ui/domain/server";
import { Folder, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Link, useNavigation, useSearchParams } from "react-router";

import type { Route } from "./+types/search";

import { paletteGroupsOf } from "../search/paletteGroups";

/** Typing waits this long before it searches, so each keystroke isn't a request. */
const TYPE_DELAY_MS = 200;

export const loader = async ({
  request,
}: Route.LoaderArgs): Promise<{ q: string } & CommandPaletteResults> => {
  await requireIdentityFromRequest(request);
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (!q.trim()) return { groups: [], q };
  const cookie = request.headers.get("cookie") ?? undefined;
  try {
    const [policies, procedures, categories] = await Promise.all([
      listPolicies(DocumentType.Policy, cookie),
      listPolicies(DocumentType.Procedure, cookie),
      listCategories(cookie),
    ]);
    return { groups: paletteGroupsOf(policies, procedures, categories, q), q };
  } catch (error) {
    return { failure: refusalOf(error), groups: [], q };
  }
};

/** A box for one of the page's states (U5): Start typing, Searching…, No results. */
const StateBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-1 rounded-[8px] border border-border bg-surface p-4 text-center text-muted">
    {children}
  </div>
);

const ResultGroup = ({ group }: { group: CommandPaletteResults["groups"][number] }) => {
  const { t } = useTranslation("shell");
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-1.5">
      <h2
        className="px-2.5 text-2xs font-semibold tracking-[.06em] text-muted uppercase"
        id={headingId}
      >
        {t(`palette.groups.${group.id}`, { defaultValue: group.id })}
      </h2>
      <ul className="overflow-hidden rounded-[8px] border border-border bg-surface">
        {group.items.map((item) => (
          <li className="border-b border-border last:border-b-0" key={item.id}>
            <Link
              className="flex items-center gap-2 px-3 py-2.5 text-ink no-underline hover:bg-primary-soft hover:text-on-primary-soft"
              to={item.to}
            >
              {item.icon === "folder" ? (
                <Folder aria-hidden="true" className="size-4 shrink-0" />
              ) : null}
              <span className="flex min-w-0 flex-col">
                <b className="font-semibold">{item.label}</b>
                {item.hint ? <span className="text-xs text-muted">{item.hint}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

/**
 * Search (U5): the field, the operators help, and its states (Start typing to search,
 * Searching…, No results) or the results grouped the way the command palette (H10) groups
 * them, from the same search. The words live in the address, so a result list can be shared.
 */
export default function SearchRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("search");
  const navigation = useNavigation();
  const [parameters, setParameters] = useSearchParams();
  const q = parameters.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    setInput(q);
  }

  useEffect(() => {
    const next = input.trim();
    if (next === q.trim()) return;
    const timer = setTimeout(
      () => setParameters(next ? { q: next } : {}, { replace: true }),
      TYPE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [input, q, setParameters]);

  const searching = navigation.state === "loading" && navigation.location?.pathname === "/search";
  const typed = input.trim();
  const groups = loaderData.groups.filter((group) => group.items.length > 0);

  let body: React.ReactNode;
  if (!typed) {
    body = <StateBox>{t("start.title")}</StateBox>;
  } else if (searching || typed !== loaderData.q.trim()) {
    body = <StateBox>{t("searching")}</StateBox>;
  } else if (loaderData.failure) {
    body = <ReachError action={t("action")} failure={loaderData.failure} />;
  } else if (groups.length === 0) {
    body = (
      <StateBox>
        <b className="text-ink">{t("noResults.title")}</b>
        <span>{t("noResults.description", { query: loaderData.q })}</span>
      </StateBox>
    );
  } else {
    body = groups.map((group) => <ResultGroup group={group} key={group.id} />);
  }

  return (
    <div className="flex w-full flex-col gap-3 p-6">
      <PageHeader subtitle={t("subtitleEmpty")} title={t("title")} />
      <form
        className="flex h-11 items-center gap-2.5 rounded-[8px] border-2 border-primary bg-surface px-3 shadow-[0_0_0_3px_var(--primary-soft)]"
        onSubmit={(event) => event.preventDefault()}
        role="search"
      >
        <Search aria-hidden="true" className="size-[18px] shrink-0 text-muted" />
        <input
          aria-label={t("title")}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("placeholder")}
          type="search"
          value={input}
        />
      </form>
      <p className="flex flex-wrap gap-2.5 text-xs text-muted">
        {["phrase", "exclude", "or", "field"].map((operator) => (
          <code className="font-mono" key={operator}>
            {t(`operators.${operator}`)}
          </code>
        ))}
      </p>
      <div className="flex flex-col gap-2.5">{body}</div>
    </div>
  );
}
