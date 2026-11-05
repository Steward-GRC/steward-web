// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Organization } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Banner, Button, Switch } from "@steward-web/ui";
import { useId } from "react";
import { useFetcher } from "react-router";

import { CARD, failureOf, type OrgActionResult, succeeded } from "./orgActionResult";

/** "Login options" (A24): just-in-time provisioning and the local password fallback. */
export const LoginOptions = ({ org }: { org: Organization }) => {
  const { t } = useTranslation("admin");
  const save = useFetcher<OrgActionResult>();
  const titleId = useId();
  const jitId = useId();
  const localId = useId();
  return (
    <save.Form aria-labelledby={titleId} className={`${CARD} flex flex-col gap-3`} method="post">
      <input name="intent" type="hidden" value="update-toggles" />
      <b id={titleId}>{t("organizations.setup.login.title")}</b>
      <label className="flex items-center justify-between gap-3" htmlFor={jitId}>
        <span>
          <span className="block text-sm font-medium">{t("organizations.setup.login.jit")}</span>
          <span className="block text-sm text-muted">{t("organizations.setup.login.jitHint")}</span>
        </span>
        <Switch defaultChecked={org.jitEnabled} id={jitId} name="jitEnabled" />
      </label>
      <label className="flex items-center justify-between gap-3" htmlFor={localId}>
        <span>
          <span className="block text-sm font-medium">
            {t("organizations.setup.login.localPassword")}
          </span>
          <span className="block text-sm text-muted">
            {t("organizations.setup.login.localPasswordHint")}
          </span>
        </span>
        <Switch defaultChecked={org.allowLocal} id={localId} name="allowLocal" />
      </label>
      {failureOf(save) ? (
        <Banner
          failure={failureOf(save)}
          title={t("organizations.setup.login.failed")}
          tone="danger"
        />
      ) : null}
      <div className="flex items-center gap-3">
        <Button busy={save.state !== "idle"} type="submit">
          {t("organizations.setup.login.save")}
        </Button>
        {succeeded(save) ? (
          <span className="text-sm font-semibold text-ok">
            {t("organizations.setup.login.saved")}
          </span>
        ) : null}
      </div>
    </save.Form>
  );
};
