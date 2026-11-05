// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Organization } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Detail,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  Field,
  Input,
  RadioGroup,
  RadioItem,
} from "@steward-web/ui";
import { useId, useState } from "react";
import { useFetcher } from "react-router";

import { CARD, failureOf, type OrgActionResult, problemOf, succeeded } from "./orgActionResult";

const PROTOCOLS = ["saml", "oidc"] as const;

/**
 * Step 1, details (A24): who the connection is for and how it signs in, the write-only OIDC
 * client secret, and the protocol, whose change is destructive (D25).
 */
export const ConnectionDetails = ({ org }: { org: Organization }) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const secret = useFetcher<OrgActionResult>();
  const protocol = useFetcher<OrgActionResult>();
  const [chosen, setChosen] = useState<string>(org.protocol);
  const [confirming, setConfirming] = useState(false);

  return (
    <section aria-labelledby={titleId} className={`${CARD} flex flex-col gap-3`}>
      <b id={titleId}>{t("organizations.setup.details.title")}</b>
      <dl className="grid gap-2 sm:grid-cols-3">
        <Detail label={t("organizations.setup.details.organization")} value={org.orgName} />
        <Detail
          label={t("organizations.setup.details.protocol")}
          value={org.protocol.toUpperCase()}
        />
        <Detail
          label={t("organizations.setup.details.displayName")}
          value={org.displayName || "—"}
        />
      </dl>

      {org.protocol === "oidc" ? (
        <secret.Form className="flex flex-col gap-2 border-t border-border pt-3" method="post">
          <input name="intent" type="hidden" value="set-client-secret" />
          {org.secretReentryRequired ? (
            <Banner title={t("organizations.setup.secret.reentry")} tone="warn">
              {t("organizations.setup.secret.reentryDetail")}
            </Banner>
          ) : null}
          <Field
            error={problemOf(secret) ? t("organizations.setup.secret.required") : undefined}
            hint={t("organizations.setup.secret.hint")}
            label={t("organizations.setup.secret.title")}
          >
            <Input autoComplete="off" name="clientSecret" type="password" />
          </Field>
          {failureOf(secret) ? (
            <Banner
              failure={failureOf(secret)}
              title={t("organizations.setup.secret.failed")}
              tone="danger"
            />
          ) : null}
          <div className="flex items-center gap-3">
            <Button busy={secret.state !== "idle"} type="submit" variant="secondary">
              {t("organizations.setup.secret.replace")}
            </Button>
            {succeeded(secret) ? (
              <span className="text-sm font-semibold text-ok">
                {t("organizations.setup.secret.replaced")}
              </span>
            ) : null}
          </div>
        </secret.Form>
      ) : null}

      <fieldset className="flex flex-col gap-2 border-t border-border pt-3">
        <legend className="mb-2 text-sm font-semibold">
          {t("organizations.setup.protocol.title")}
        </legend>
        <RadioGroup className="flex gap-5" onValueChange={setChosen} value={chosen}>
          {PROTOCOLS.map((entry) => (
            <RadioItem key={entry} value={entry}>
              {entry.toUpperCase()}
            </RadioItem>
          ))}
        </RadioGroup>
        <Button
          className="self-start"
          disabled={chosen === org.protocol}
          onClick={() => setConfirming(true)}
          variant="secondary"
        >
          {t("organizations.setup.protocol.change")}
        </Button>
        {failureOf(protocol) ? (
          <Banner
            failure={failureOf(protocol)}
            title={t("organizations.setup.protocol.failed")}
            tone="danger"
          />
        ) : null}
      </fieldset>

      <Dialog onOpenChange={setConfirming} open={confirming}>
        <DialogContent
          description={t("organizations.setup.protocol.dialogDescription")}
          title={t("organizations.setup.protocol.dialogTitle", {
            domain: org.domain,
            protocol: chosen.toUpperCase(),
          })}
          tone="danger"
        >
          <protocol.Form method="post" onSubmit={() => setConfirming(false)}>
            <input name="intent" type="hidden" value="change-protocol" />
            <input name="protocol" type="hidden" value={chosen} />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("organizations.setup.protocol.cancel")}</Button>
              </DialogClose>
              <Button type="submit" variant="danger">
                {t("organizations.setup.protocol.confirm")}
              </Button>
            </DialogFooter>
          </protocol.Form>
        </DialogContent>
      </Dialog>
    </section>
  );
};
