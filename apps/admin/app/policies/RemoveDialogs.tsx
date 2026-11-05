// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogNote,
  notify,
} from "@steward-web/ui";
import { documentTypeBasePath, type PolicyDetail, PolicyStatus } from "@steward-web/ui/domain";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { refusalIn, useGovernanceFetcher, useNouns } from "./useGovernance";

/** Retire (D10) or delete (D4): post the intent, then return to the list with a toast. */
const useRemoval = (detail: PolicyDetail, intent: "delete" | "retire") => {
  const { t } = useTranslation("admin");
  const fetcher = useGovernanceFetcher();
  const navigate = useNavigate();
  const done = fetcher.state === "idle" && fetcher.data?.ok === true;
  useEffect(() => {
    if (!done) return;
    notify.success(t(`governance.${intent}.done`, { title: detail.title }));
    void navigate(documentTypeBasePath(detail.documentType));
  }, [detail.documentType, detail.title, done, intent, navigate, t]);
  return fetcher;
};

/** D10: "Retire this policy?" It hides it and cancels outstanding acknowledgements. */
export const RetireDialog = ({ detail }: { detail: PolicyDetail }) => {
  const { t } = useTranslation("admin");
  const { noun } = useNouns(detail);
  const fetcher = useRemoval(detail, "retire");
  const failure = refusalIn(fetcher);
  return (
    <DialogContent
      busy={fetcher.state !== "idle"}
      description={t("governance.retire.description", {
        number: detail.number,
        title: detail.title,
      })}
      title={t("governance.retire.title", { noun })}
      tone="danger"
    >
      <fetcher.Form method="post">
        <input name="intent" type="hidden" value="retire" />
        {failure ? (
          <DialogBody>
            <Banner failure={failure} title={t("governance.failed")} tone="danger" />
          </DialogBody>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("actions.cancel", { ns: "common" })}</Button>
          </DialogClose>
          <Button busy={fetcher.state !== "idle"} type="submit" variant="danger">
            {t("governance.retire.cta", { noun })}
          </Button>
        </DialogFooter>
      </fetcher.Form>
    </DialogContent>
  );
};

/** D4: "Permanently delete this policy?" Only a policy that was never published can go. */
export const DeleteDialog = ({ detail }: { detail: PolicyDetail }) => {
  const { t } = useTranslation("admin");
  const { noun, nounPlural } = useNouns(detail);
  const fetcher = useRemoval(detail, "delete");
  const failure = refusalIn(fetcher);
  const everPublished = detail.status === PolicyStatus.Published || Boolean(detail.published);
  return (
    <DialogContent
      busy={fetcher.state !== "idle"}
      description={t("governance.delete.description", { noun })}
      title={t("governance.delete.title", { noun })}
      tone="danger"
    >
      <fetcher.Form method="post">
        <input name="intent" type="hidden" value="delete" />
        <DialogBody>
          <DialogNote>{t("governance.delete.published", { nounPlural })}</DialogNote>
          {failure ? (
            <Banner failure={failure} title={t("governance.failed")} tone="danger" />
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("actions.cancel", { ns: "common" })}</Button>
          </DialogClose>
          <Button
            busy={fetcher.state !== "idle"}
            disabled={everPublished}
            type="submit"
            variant="danger"
          >
            {t("governance.delete.cta", { noun })}
          </Button>
        </DialogFooter>
      </fetcher.Form>
    </DialogContent>
  );
};
