// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User, UserDeletionPreview } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Field,
  Select,
  TypeToConfirm,
} from "@steward-web/ui";
import { useState } from "react";
import { useFetcher } from "react-router";

import { failureOf, type UserActionResult } from "./userActionResult";

const COUNTS = [
  "pendingApprovals",
  "ownedPolicies",
  "raciGrants",
  "roles",
  "permissions",
  "groupMemberships",
  "idpGroups",
  "policyOverrides",
  "breakGlassGrants",
  "managedGroups",
] as const;

/** Which count tile each kind of blocking item belongs to. */
const BLOCKING_KINDS: Record<string, (typeof COUNTS)[number]> = {
  OWNED_POLICY: "ownedPolicies",
  PENDING_APPROVAL: "pendingApprovals",
};

/**
 * Delete user (D20), a wide destructive dialog: "Re-assign all to" for their owned policies,
 * the deletion preview as ten count tiles, and "This account can't be deleted yet" with what to
 * clear while something blocks it. "Continue to delete" then asks for their email (D17).
 */
export const DeleteUserDialog = ({
  disabled,
  people,
  preview,
  user,
}: {
  disabled: boolean;
  people: readonly { id: string; name: string }[];
  preview: null | UserDeletionPreview;
  user: User;
}) => {
  const { t } = useTranslation("admin");
  const reassign = useFetcher<UserActionResult>();
  const remove = useFetcher<UserActionResult>();
  const [stage, setStage] = useState<"closed" | "confirm" | "preview">("closed");
  const [target, setTarget] = useState("");

  const blocking = preview?.items.filter((item) => item.blocksDelete) ?? [];
  // A tile turns red while items of its class block the delete, as pending approvals do in
  // the frame.
  const blockedKinds = new Set<string>(blocking.map((item) => item.kind));
  const blocks = (key: (typeof COUNTS)[number]) =>
    Object.entries(BLOCKING_KINDS).some(([kind, count]) => count === key && blockedKinds.has(kind));

  return (
    <>
      <Dialog
        onOpenChange={(open) => setStage(open ? "preview" : "closed")}
        open={stage === "preview"}
      >
        <DialogTrigger asChild>
          <Button className="h-[34px] px-3" disabled={disabled} variant="danger">
            {t("users.advanced.delete.action")}
          </Button>
        </DialogTrigger>
        {preview ? (
          <DialogContent
            description={t("users.deleteDialog.description")}
            hasInput
            size="wide"
            title={t("users.deleteDialog.title", { name: user.name })}
            tone="danger"
          >
            <DialogBody>
              {preview.counts.ownedPolicies > 0 ? (
                <reassign.Form className="flex items-end gap-2" method="post">
                  <input name="intent" type="hidden" value="reassign" />
                  <input name="toUserId" type="hidden" value={target} />
                  <Field className="flex-1" label={t("users.deleteDialog.reassignTo")}>
                    <Select
                      className="h-10"
                      onValueChange={setTarget}
                      options={people.map((person) => ({ label: person.name, value: person.id }))}
                      placeholder={t("users.deleteDialog.choose")}
                      value={target}
                    />
                  </Field>
                  <Button
                    busy={reassign.state !== "idle"}
                    className="h-10"
                    disabled={!target}
                    type="submit"
                    variant="secondary"
                  >
                    {t("users.deleteDialog.reassign")}
                  </Button>
                </reassign.Form>
              ) : null}
              {failureOf(reassign) ? (
                <Banner
                  failure={failureOf(reassign)}
                  title={t("users.deleteDialog.failed")}
                  tone="danger"
                />
              ) : null}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {COUNTS.map((key) => (
                  <div
                    className={cn(
                      "flex flex-col gap-0.5 rounded-lg p-2.5",
                      blocks(key)
                        ? "bg-danger-soft shadow-[inset_0_0_0_1px_var(--danger)]"
                        : "shadow-[inset_0_0_0_1px_var(--border)]",
                    )}
                    key={key}
                  >
                    <b className={cn("text-lg", blocks(key) && "text-danger")}>
                      {preview.counts[key]}
                    </b>
                    <span className="text-2xs text-muted">
                      {t(`users.deleteDialog.counts.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
              {preview.blocksDelete ? (
                <div className="flex flex-col gap-1 rounded-lg bg-danger-soft px-3.5 py-3 text-danger">
                  <b>{t("users.deleteDialog.blocked")}</b>
                  {blocking.length > 0 ? (
                    <span>
                      {t("users.deleteDialog.clearFirst", {
                        items: blocking.map((item) => `${item.label} · ${item.detail}`).join("; "),
                      })}
                    </span>
                  ) : null}
                </div>
              ) : null}
              {preview.warnings.map((warning) => (
                <Banner key={warning.code} title={warning.message} tone="warn" />
              ))}
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("users.deleteDialog.cancel")}</Button>
              </DialogClose>
              <Button
                disabled={preview.blocksDelete}
                onClick={() => setStage("confirm")}
                variant="danger"
              >
                {t("users.deleteDialog.continue")}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog
        onOpenChange={(open) => setStage(open ? "confirm" : "closed")}
        open={stage === "confirm"}
      >
        <DialogContent
          busy={remove.state !== "idle"}
          description={t("users.deleteDialog.confirmDescription")}
          hasInput
          title={t("users.deleteDialog.confirmTitle", { name: user.name })}
          tone="danger"
        >
          <remove.Form method="post">
            <input name="intent" type="hidden" value="delete" />
            <TypeToConfirm phrase={user.email}>
              {(confirmed) => (
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">{t("users.deleteDialog.cancel")}</Button>
                  </DialogClose>
                  <Button
                    busy={remove.state !== "idle"}
                    disabled={!confirmed}
                    type="submit"
                    variant="danger"
                  >
                    {t("users.deleteDialog.confirm")}
                  </Button>
                </DialogFooter>
              )}
            </TypeToConfirm>
          </remove.Form>
          {failureOf(remove) ? (
            <Banner
              className="mx-5 mb-4"
              failure={failureOf(remove)}
              title={t("users.deleteDialog.failed")}
              tone="danger"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};
