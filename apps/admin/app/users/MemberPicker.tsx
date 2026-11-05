// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Input, Popover, PopoverContent, PopoverTrigger } from "@steward-web/ui";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

interface Person {
  email: string;
  id: string;
  name: string;
}

/**
 * "Add member…" (A22): a chip that opens a search, then the people it finds. Choosing one
 * adds them to the group.
 */
export const MemberPicker = ({
  exclude,
  onPick,
}: {
  exclude: ReadonlySet<string>;
  onPick: (userId: string) => void;
}) => {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const search = useFetcher<{ people: Person[] }>();
  const { load } = search;

  useEffect(() => {
    if (open && query.trim().length >= 2) {
      void load(`/resources/user-search?${new URLSearchParams({ q: query.trim() }).toString()}`);
    }
  }, [load, open, query]);

  const people = (search.data?.people ?? []).filter((person) => !exclude.has(person.id));

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <button
          className="flex h-7 items-center rounded-full px-2.5 font-semibold text-primary shadow-[inset_0_0_0_1px_var(--border-strong)] hover:bg-sunken"
          type="button"
        >
          {t("myGroups.add")}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-72 flex-col gap-2 p-2">
        <Input
          aria-label={t("myGroups.find")}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("myGroups.findPlaceholder")}
          type="search"
          value={query}
        />
        {query.trim().length >= 2 && search.state === "idle" && people.length === 0 ? (
          <p className="px-1 text-sm text-muted">{t("myGroups.noMatches")}</p>
        ) : null}
        <ul className="flex flex-col">
          {people.map((person) => (
            <li key={person.id}>
              <button
                className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-primary-soft hover:text-on-primary-soft"
                onClick={() => {
                  onPick(person.id);
                  setOpen(false);
                  setQuery("");
                }}
                type="button"
              >
                {t("myGroups.person", { email: person.email, name: person.name })}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
