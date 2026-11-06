// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  acceptsDocumentType,
  type CategoryDocumentTypes,
  documentTypesOf,
  refusalKey,
} from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  Field,
  notify,
  Select,
} from "@steward-web/ui";
import { DocumentType, documentTypeBasePath, type PolicyDetail } from "@steward-web/ui/domain";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

import { refusalIn, useGovernanceFetcher, useNouns } from "./useGovernance";

interface Section {
  documentTypes?: CategoryDocumentTypes;
  id: string;
  path: string;
}

/**
 * D6: "Move to section". "Destination section" lists every category by its path; "New number"
 * is read-only, in mono. Once it's moved the reader opens the policy at its new number.
 */
export const MoveDialog = ({ detail, onDone }: { detail: PolicyDetail; onDone: () => void }) => {
  const { t } = useTranslation("admin");
  const { noun } = useNouns(detail);
  const fetcher = useGovernanceFetcher();
  const sections = useFetcher<{ sections: Section[] }>();
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const failure = refusalIn(fetcher);
  const { load } = sections;

  useEffect(() => {
    void load("/resources/sections");
  }, [load]);

  const moved =
    fetcher.state === "idle" && fetcher.data?.ok && fetcher.data.intent === "move"
      ? fetcher.data.number
      : undefined;
  useEffect(() => {
    if (!moved) return;
    notify.success(t("governance.move.done", { number: moved }));
    // The reader stays mounted across the new number, so the dialog closes itself.
    onDone();
    void navigate(`${documentTypeBasePath(detail.documentType)}/${encodeURIComponent(moved)}`);
  }, [detail.documentType, moved, navigate, onDone, t]);

  // A section that does not hold this kind of document stays in the list, greyed out with why
  // (#87); the service refuses the move too.
  const kind = detail.documentType === DocumentType.Procedure ? "PROCEDURE" : "POLICY";
  const options = (sections.data?.sections ?? []).map((section) => {
    const holds = acceptsDocumentType(documentTypesOf(section), kind);
    return {
      disabled: !holds,
      label: holds
        ? section.path
        : t("governance.move.refused", {
            path: section.path,
            why: t(`governance.move.holds.${refusalKey(documentTypesOf(section))}`),
          }),
      value: section.id,
    };
  });

  return (
    <DialogContent
      busy={fetcher.state !== "idle"}
      description={t("governance.move.description", { noun })}
      hasInput
      title={t("governance.move.title")}
    >
      <fetcher.Form method="post">
        <input name="intent" type="hidden" value="move" />
        <input name="homeCategoryId" type="hidden" value={target} />
        <DialogBody>
          <Field label={t("governance.move.destination")}>
            <Select
              className="h-10"
              disabled={!sections.data}
              onValueChange={setTarget}
              options={options}
              placeholder={
                sections.data ? t("governance.move.choose") : t("governance.move.loading")
              }
              value={target}
            />
          </Field>
          <div className="grid gap-1.5">
            <span className="text-sm font-semibold text-ink">{t("governance.move.newNumber")}</span>
            <span className="flex h-10 items-center rounded-md border border-border bg-sunken px-3 font-mono text-muted">
              {t("governance.move.numberLater")}
            </span>
          </div>
          {failure ? (
            <Banner failure={failure} title={t("governance.failed")} tone="danger" />
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("actions.cancel", { ns: "common" })}</Button>
          </DialogClose>
          <Button busy={fetcher.state !== "idle"} disabled={!target} type="submit">
            {t("governance.move.cta", { noun })}
          </Button>
        </DialogFooter>
      </fetcher.Form>
    </DialogContent>
  );
};
