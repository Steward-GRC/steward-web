// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Dialog, DialogContent, DialogFooter } from "@steward-web/ui";

import { CopyDiagnostics } from "./CopyDiagnostics";

const version = typeof __STEWARD_VERSION__ === "string" ? __STEWARD_VERSION__ : "dev";
const commit = typeof __STEWARD_COMMIT__ === "string" ? __STEWARD_COMMIT__ : "unknown";

/**
 * The shell's own About and diagnostics entry (the account menu): the same Copy diagnostics
 * button as every error treatment, with nothing to report (`failure` is omitted), so a
 * visitor can send a report before anything has gone wrong.
 */
export const AboutDiagnostics = ({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const { t } = useTranslation("shell");
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent title={t("about.title")}>
        <p className="text-base text-muted">{t("about.version", { commit, version })}</p>
        <DialogFooter>
          <CopyDiagnostics />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
