// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  cn,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  Field,
  Input,
  notify,
} from "@steward-web/ui";
import { type PolicyDetail } from "@steward-web/ui/domain";
import { useEffect, useId, useState } from "react";
import { useFetcher } from "react-router";

import { refusalIn, useGovernanceFetcher } from "./useGovernance";

interface Person {
  email: string;
  id: string;
  name: string;
}

/**
 * D5: "Change author". "New author" searches the directory as it's typed (the same lookup as
 * "Add member…"); picking someone fills the field, and "Change author" hands them the policy.
 */
export const ChangeAuthorDialog = ({
  detail,
  onDone,
}: {
  detail: PolicyDetail;
  onDone: () => void;
}) => {
  const { t } = useTranslation("admin");
  const fetcher = useGovernanceFetcher();
  const search = useFetcher<{ people: Person[] }>();
  const { load } = search;
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Person>();
  const listId = useId();
  const failure = refusalIn(fetcher);
  const done = fetcher.state === "idle" && fetcher.data?.ok === true;

  const typed = query.trim();
  const searching = !picked && typed.length >= 2;
  useEffect(() => {
    if (searching) {
      void load(`/resources/user-search?${new URLSearchParams({ q: typed }).toString()}`);
    }
  }, [load, searching, typed]);

  useEffect(() => {
    if (!done || !picked) return;
    notify.success(t("governance.changeAuthor.done", { name: picked.name }));
    onDone();
  }, [done, onDone, picked, t]);

  const people = searching ? (search.data?.people ?? []) : [];

  return (
    <DialogContent
      busy={fetcher.state !== "idle"}
      description={t("governance.changeAuthor.description", { title: detail.title })}
      hasInput
      title={t("governance.changeAuthor.title")}
    >
      <fetcher.Form method="post">
        <input name="intent" type="hidden" value="changeAuthor" />
        <input name="ownerUserId" type="hidden" value={picked?.id ?? ""} />
        <DialogBody>
          <Field label={t("governance.changeAuthor.field")}>
            <Input
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded={people.length > 0}
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value);
                setPicked(undefined);
              }}
              placeholder={t("governance.changeAuthor.placeholder")}
              role="combobox"
              value={picked ? picked.name : query}
            />
          </Field>
          {searching && search.state === "idle" && search.data && people.length === 0 ? (
            <p className="text-sm text-muted">{t("governance.changeAuthor.noMatches")}</p>
          ) : null}
          <ul
            aria-label={t("governance.changeAuthor.field")}
            className={cn("flex flex-col", people.length === 0 && "hidden")}
            id={listId}
            role="listbox"
          >
            {people.map((person) => (
              <li
                aria-selected={false}
                className="cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-primary-soft hover:text-on-primary-soft"
                key={person.id}
                onClick={() => setPicked(person)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setPicked(person);
                  }
                }}
                role="option"
                tabIndex={0}
              >
                {t("myGroups.person", { email: person.email, name: person.name })}
              </li>
            ))}
          </ul>
          {failure ? (
            <Banner failure={failure} title={t("governance.failed")} tone="danger" />
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("actions.cancel", { ns: "common" })}</Button>
          </DialogClose>
          <Button busy={fetcher.state !== "idle"} disabled={!picked} type="submit">
            {t("governance.changeAuthor.cta")}
          </Button>
        </DialogFooter>
      </fetcher.Form>
    </DialogContent>
  );
};
