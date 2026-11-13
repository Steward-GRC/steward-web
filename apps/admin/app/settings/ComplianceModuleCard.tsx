// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  type Failure,
  Switch,
} from "@steward-web/ui";
import { useState } from "react";

import { SettingsCard } from "./SettingsCard";

export interface ComplianceModuleCardProps {
  busy: boolean;
  enabled: boolean;
  /** The known refusal code of the last change, worded here. */
  errorCode?: string;
  /** Any other refusal of the last change. */
  failure?: Failure;
  onChange: (enabled: boolean) => void;
}

/**
 * The Compliance module card: its on/off switch. Either way the change asks first, because
 * off stops all reporting for everyone and on opens it again. The switch only moves once the
 * gateway has answered, so it never shows a state that was not stored.
 */
export const ComplianceModuleCard = ({
  busy,
  enabled,
  errorCode,
  failure,
  onChange,
}: ComplianceModuleCardProps) => {
  const { t } = useTranslation("admin");
  const [asking, setAsking] = useState(false);
  const key = enabled ? "turnOff" : "turnOn";

  return (
    <SettingsCard
      description={t("settings.compliance.description")}
      pill={enabled ? t("settings.pills.on") : t("settings.pills.off")}
      title={t("settings.compliance.title")}
      tone={enabled ? "ok" : "warn"}
    >
      <label className="flex items-center gap-3 text-sm">
        <Switch
          aria-label={t("settings.compliance.switch")}
          checked={enabled}
          disabled={busy}
          onCheckedChange={() => setAsking(true)}
        />
        {t("settings.compliance.switch")}
      </label>
      {errorCode ? (
        <Banner title={t("settings.compliance.failed")} tone="danger">
          {t(`settings.complianceErrors.${errorCode}`)}
        </Banner>
      ) : failure ? (
        <Banner failure={failure} title={t("settings.compliance.failed")} tone="danger" />
      ) : null}
      <Dialog onOpenChange={setAsking} open={asking}>
        <DialogContent
          description={t(`settings.compliance.${key}.description`)}
          title={t(`settings.compliance.${key}.title`)}
          tone={enabled ? "danger" : "primary"}
        >
          <DialogBody />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{t("settings.compliance.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setAsking(false);
                onChange(!enabled);
              }}
              variant={enabled ? "danger" : "primary"}
            >
              {t(`settings.compliance.${key}.confirm`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsCard>
  );
};
