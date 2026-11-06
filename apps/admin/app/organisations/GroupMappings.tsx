// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GroupMapping } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  EmptyState,
  Field,
  Input,
  Select,
} from "@steward-web/ui";
import { X } from "lucide-react";
import { useId, useState } from "react";
import { useFetcher } from "react-router";

import { CARD, failureOf, type OrgActionResult, problemOf } from "./orgActionResult";

/** One mapping, with its remove button behind D29's confirm. */
const MappingRow = ({ group, mapping }: { group: string; mapping: GroupMapping }) => {
  const { t } = useTranslation("admin");
  const remove = useFetcher<OrgActionResult>();
  const [open, setOpen] = useState(false);
  return (
    <li className="flex items-center gap-3 border-b border-border py-2 last:border-b-0">
      <span className="min-w-0 flex-1 font-mono text-sm">{mapping.idpGroupClaimValue}</span>
      <span aria-hidden="true" className="text-muted">
        →
      </span>
      <span className="min-w-0 flex-1 text-sm">{group}</span>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <button
            aria-label={t("organizations.setup.mappings.removeLabel", {
              claim: mapping.idpGroupClaimValue,
            })}
            className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-sunken hover:text-ink"
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </DialogTrigger>
        <DialogContent
          description={t("organizations.setup.mappings.dialogDescription", {
            claim: mapping.idpGroupClaimValue,
            group,
          })}
          title={t("organizations.setup.mappings.dialogTitle")}
          tone="danger"
        >
          <remove.Form method="post" onSubmit={() => setOpen(false)}>
            <input name="intent" type="hidden" value="delete-mapping" />
            <input name="mappingId" type="hidden" value={mapping.id} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("organizations.setup.mappings.cancel")}</Button>
              </DialogClose>
              <Button type="submit" variant="danger">
                {t("organizations.setup.mappings.confirm")}
              </Button>
            </DialogFooter>
          </remove.Form>
        </DialogContent>
      </Dialog>
    </li>
  );
};

/** "Group mappings" (A24): IdP claim → platform group, added here and removed with D29. */
export const GroupMappings = ({
  connectionId,
  groupOptions,
  mappings,
}: {
  connectionId: string;
  groupOptions: readonly { id: string; path: string }[];
  mappings: readonly GroupMapping[];
}) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const add = useFetcher<OrgActionResult>();
  const [target, setTarget] = useState("");
  const groupOf = (id: string) => groupOptions.find((entry) => entry.id === id)?.path ?? id;
  return (
    <section aria-labelledby={titleId} className={`${CARD} flex flex-col gap-2`}>
      <b id={titleId}>{t("organizations.setup.mappings.title")}</b>
      {mappings.length === 0 ? (
        <EmptyState className="py-4" title={t("organizations.setup.mappings.empty")} />
      ) : (
        <ul className="flex flex-col">
          {mappings.map((mapping) => (
            <MappingRow group={groupOf(mapping.targetGroupId)} key={mapping.id} mapping={mapping} />
          ))}
        </ul>
      )}
      <add.Form
        className="flex flex-wrap items-end gap-3 border-t border-border pt-3"
        method="post"
        onSubmit={() => setTarget("")}
      >
        <input name="intent" type="hidden" value="add-mapping" />
        <input name="connectionId" type="hidden" value={connectionId} />
        <input name="targetGroupId" type="hidden" value={target} />
        <Field className="min-w-[180px] flex-1" label={t("organizations.setup.mappings.claim")}>
          <Input name="idpGroupClaimValue" required />
        </Field>
        <Field className="min-w-[180px] flex-1" label={t("organizations.setup.mappings.group")}>
          <Select
            onValueChange={setTarget}
            options={groupOptions.map((entry) => ({ label: entry.path, value: entry.id }))}
            placeholder={t("organizations.setup.mappings.choose")}
            value={target}
          />
        </Field>
        <Button busy={add.state !== "idle"} disabled={!target} type="submit" variant="secondary">
          {t("organizations.setup.mappings.add")}
        </Button>
      </add.Form>
      {problemOf(add) ? (
        <p className="text-sm text-danger">{t("organizations.setup.mappings.required")}</p>
      ) : null}
      {failureOf(add) ? (
        <Banner
          failure={failureOf(add)}
          title={t("organizations.setup.mappings.failed")}
          tone="danger"
        />
      ) : null}
    </section>
  );
};
