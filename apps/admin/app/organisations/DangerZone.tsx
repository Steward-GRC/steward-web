// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@steward-web/ui";
import { useId } from "react";
import { useFetcher } from "react-router";

import { failureOf, type OrgActionResult } from "./orgActionResult";

/** The danger zone (A24): "Delete organization" (D26), only once the connection is disabled. */
export const DangerZone = ({ canDelete, domain }: { canDelete: boolean; domain: string }) => {
  const { t } = useTranslation("admin");
  const remove = useFetcher<OrgActionResult>();
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-2 rounded-[10px] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--danger)]"
    >
      <b className="text-danger" id={titleId}>
        {t("organizations.setup.danger.title")}
      </b>
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-sm text-muted">
          {canDelete
            ? t("organizations.setup.danger.dialogDescription")
            : t("organizations.setup.danger.deleteHint")}
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={!canDelete} variant="danger">
              {t("organizations.setup.danger.delete")}
            </Button>
          </DialogTrigger>
          <DialogContent
            description={t("organizations.setup.danger.dialogDescription")}
            title={t("organizations.setup.danger.dialogTitle", { domain })}
            tone="danger"
          >
            <remove.Form method="post">
              <input name="intent" type="hidden" value="delete" />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("organizations.setup.danger.cancel")}</Button>
                </DialogClose>
                <Button busy={remove.state !== "idle"} type="submit" variant="danger">
                  {t("organizations.setup.danger.confirm")}
                </Button>
              </DialogFooter>
            </remove.Form>
          </DialogContent>
        </Dialog>
      </div>
      {failureOf(remove) ? (
        <Banner
          failure={failureOf(remove)}
          title={t("organizations.setup.danger.failed")}
          tone="danger"
        />
      ) : null}
    </section>
  );
};
