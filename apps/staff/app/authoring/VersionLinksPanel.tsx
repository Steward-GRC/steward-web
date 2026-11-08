// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  ContactBlock,
  DefinitionEntry,
  Reference,
  RelationshipType,
  VersionLinks,
} from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Button } from "@steward-web/ui";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { useFetcher } from "react-router";

import { availableTo, moveId } from "./versionLinks";

/** What the author can pick from: the libraries, and the other policies for Related. */
export interface LinkLibrary {
  contacts: readonly ContactBlock[];
  definitions: readonly DefinitionEntry[];
  policies: readonly { id: string; number: string; title: string }[];
  references: readonly Reference[];
}

const selectClass =
  "h-9 min-w-0 max-w-full rounded-md border border-border bg-surface px-2 text-base";

const Section = ({ children, title }: { children: ReactNode; title: string }) => {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="flex w-full flex-col gap-2.5 rounded-lg border border-border bg-surface p-4"
    >
      <h2 className="text-base font-semibold" id={id}>
        {title}
      </h2>
      {children}
    </section>
  );
};

const IconButton = ({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    aria-label={label}
    className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-sunken"
    onClick={onClick}
    title={label}
    type="button"
  >
    {children}
  </button>
);

/** A picker over the library items still free, with an Add button. */
const AddFromLibrary = ({
  label,
  onAdd,
  options,
}: {
  label: string;
  onAdd: (id: string) => void;
  options: readonly { id: string; label: string }[];
}) => {
  const { t } = useTranslation("authoring");
  const [chosen, setChosen] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={label}
        className={selectClass}
        onChange={(event) => setChosen(event.target.value)}
        value={chosen}
      >
        <option value="" />
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <Button
        disabled={chosen === ""}
        onClick={() => {
          onAdd(chosen);
          setChosen("");
        }}
        variant="secondary"
      >
        {t("editor.links.add")}
      </Button>
    </div>
  );
};

/**
 * What the version links to from the libraries (bug log 227): definitions (always alphabetical),
 * related policies with a relationship type, references and contacts (in the order the author
 * sets by hand, contacts one to a line across the page). The links belong to the version and are
 * approved with it; the library items stay unversioned. Each change replaces that kind of link.
 */
export const VersionLinksPanel = ({
  library,
  links,
  policyId,
  relationshipTypes,
}: {
  library: LinkLibrary;
  links: VersionLinks;
  /** This policy, which cannot be related to itself. */
  policyId: string;
  relationshipTypes: readonly RelationshipType[];
}) => {
  const { t } = useTranslation("authoring");
  const fetcher = useFetcher<{ ok: boolean }>();
  const editable = links.editable;
  const [policy, setPolicy] = useState("");
  const [type, setType] = useState(relationshipTypes[0]?.id ?? "");

  const definitionIds = links.definitions.map((entry) => entry.id);
  const referenceIds = links.references.map((entry) => entry.id);
  const contactIds = links.contacts.map((entry) => entry.id);
  const outgoing = links.related
    .filter((link) => link.direction === "OUTGOING")
    .map((link) => ({ policyId: link.policyId, type: link.type }));

  const send = (fields: Record<string, string>) => void fetcher.submit(fields, { method: "post" });
  const setDefinitions = (ids: readonly string[]) =>
    send({ definitionIds: ids.join(","), intent: "set-definitions" });
  const setReferences = (ids: readonly string[]) =>
    send({ intent: "set-references", referenceIds: ids.join(",") });
  const setContacts = (ids: readonly string[]) =>
    send({ contactBlockIds: ids.join(","), intent: "set-contacts" });
  const setRelated = (next: readonly { policyId: string; type: string }[]) =>
    send({ intent: "set-related", links: JSON.stringify(next) });

  const ordered = <T extends { id: string }>(
    items: readonly T[],
    nameOf: (item: T) => string,
    describe: (item: T) => ReactNode,
    save: (ids: readonly string[]) => void,
  ) => (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item, index) => (
        <li className="flex w-full items-center gap-2 py-1.5" key={item.id}>
          <span className="min-w-0 flex-1">{describe(item)}</span>
          {editable ? (
            <>
              <IconButton
                label={t("editor.links.moveUp", { name: nameOf(item) })}
                onClick={() =>
                  save(
                    moveId(
                      items.map((entry) => entry.id),
                      index,
                      -1,
                    ),
                  )
                }
              >
                <ArrowUp aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton
                label={t("editor.links.moveDown", { name: nameOf(item) })}
                onClick={() =>
                  save(
                    moveId(
                      items.map((entry) => entry.id),
                      index,
                      1,
                    ),
                  )
                }
              >
                <ArrowDown aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton
                label={t("editor.links.remove", { name: nameOf(item) })}
                onClick={() => save(items.map((entry) => entry.id).filter((id) => id !== item.id))}
              >
                <X aria-hidden="true" className="size-4" />
              </IconButton>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex w-full flex-col gap-3.5">
      {editable ? null : <p className="text-sm text-muted">{t("editor.links.readOnly")}</p>}
      {fetcher.data && !fetcher.data.ok ? (
        <p className="text-sm text-danger" role="alert">
          {t("editor.links.failed")}
        </p>
      ) : null}

      <Section title={t("editor.links.definitions")}>
        {links.definitions.length === 0 ? (
          <p className="text-sm text-muted">{t("editor.links.none")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {links.definitions.map((entry) => (
              <li className="flex w-full items-baseline gap-2 py-1.5" key={entry.id}>
                <span className="min-w-0 flex-1">
                  <b>{entry.term}</b> <span className="text-muted">{entry.definition}</span>
                </span>
                {editable ? (
                  <IconButton
                    label={t("editor.links.remove", { name: entry.term })}
                    onClick={() => setDefinitions(definitionIds.filter((id) => id !== entry.id))}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </IconButton>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {editable ? (
          <AddFromLibrary
            label={t("editor.links.addDefinition")}
            onAdd={(id) => setDefinitions([...definitionIds, id])}
            options={availableTo(library.definitions, definitionIds, (entry) => entry.term).map(
              (entry) => ({ id: entry.id, label: entry.term }),
            )}
          />
        ) : null}
      </Section>

      <Section title={t("editor.links.related")}>
        {links.related.length === 0 ? (
          <p className="text-sm text-muted">{t("editor.links.none")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {links.related.map((link) => (
              <li
                className="flex w-full items-baseline gap-2 py-1.5"
                key={`${link.direction}-${link.policyId}-${link.type}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="text-muted">{link.label}</span>{" "}
                  <span className="font-mono text-sm">{link.number}</span> {link.title}
                </span>
                {editable && link.direction === "OUTGOING" ? (
                  <IconButton
                    label={t("editor.links.remove", { name: `${link.label} ${link.title}` })}
                    onClick={() =>
                      setRelated(
                        outgoing.filter(
                          (entry) =>
                            !(entry.policyId === link.policyId && entry.type === link.type),
                        ),
                      )
                    }
                  >
                    <X aria-hidden="true" className="size-4" />
                  </IconButton>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {editable ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label={t("editor.links.policy")}
              className={selectClass}
              onChange={(event) => setPolicy(event.target.value)}
              value={policy}
            >
              <option value="" />
              {library.policies
                .filter((entry) => entry.id !== policyId)
                .toSorted((a, b) => a.number.localeCompare(b.number))
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.number} {entry.title}
                  </option>
                ))}
            </select>
            <select
              aria-label={t("editor.links.relationship")}
              className={selectClass}
              onChange={(event) => setType(event.target.value)}
              value={type}
            >
              {relationshipTypes.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              disabled={policy === "" || type === ""}
              onClick={() => {
                setRelated([...outgoing, { policyId: policy, type }]);
                setPolicy("");
              }}
              variant="secondary"
            >
              {t("editor.links.add")}
            </Button>
          </div>
        ) : null}
      </Section>

      <Section title={t("editor.links.references")}>
        {links.references.length === 0 ? (
          <p className="text-sm text-muted">{t("editor.links.none")}</p>
        ) : (
          ordered(
            links.references,
            (entry) => entry.label,
            (entry) => (
              <>
                {entry.label}
                {entry.clause ? <span className="text-muted"> · {entry.clause}</span> : null}
              </>
            ),
            setReferences,
          )
        )}
        {editable ? (
          <AddFromLibrary
            label={t("editor.links.addReference")}
            onAdd={(id) => setReferences([...referenceIds, id])}
            options={availableTo(library.references, referenceIds, (entry) => entry.label).map(
              (entry) => ({ id: entry.id, label: entry.label }),
            )}
          />
        ) : null}
      </Section>

      <Section title={t("editor.links.contacts")}>
        {links.contacts.length === 0 ? (
          <p className="text-sm text-muted">{t("editor.links.none")}</p>
        ) : (
          ordered(
            links.contacts,
            (entry) => entry.label,
            (entry) => (
              <span className="flex flex-wrap gap-x-3">
                <b>{entry.label}</b>
                {[entry.name, entry.role, entry.email, entry.phone].filter(Boolean).map((part) => (
                  <span className="text-muted" key={part}>
                    {part}
                  </span>
                ))}
              </span>
            ),
            setContacts,
          )
        )}
        {editable ? (
          <AddFromLibrary
            label={t("editor.links.addContact")}
            onAdd={(id) => setContacts([...contactIds, id])}
            options={availableTo(library.contacts, contactIds, (entry) => entry.label).map(
              (entry) => ({ id: entry.id, label: entry.label }),
            )}
          />
        ) : null}
      </Section>
    </div>
  );
};
