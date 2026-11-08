// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@steward-web/ui";
import { useEffect, useState } from "react";
import { useHref } from "react-router";

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
  const { t } = useTranslation(["shell", "common"]);
  // The running build, and the mock's when the gateway is the mock, so what is under test can be
  // compared with main when diagnosing (steward-web#217). A plain fetch, so a page without the
  // route (or a gateway that fails) only leaves the lines out.
  const [builds, setBuilds] = useState<{ commit: string; mock: { commit: string } | null } | null>(
    null,
  );
  const versionPath = useHref("/resources/version");
  useEffect(() => {
    if (!open) return;
    let current = true;
    fetch(versionPath, { headers: { accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { commit: string; mock: { commit: string } | null } | null) => {
        if (current) setBuilds(body);
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [open, versionPath]);
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent title={t("about.title")}>
        <DialogBody>
          <p className="text-base text-muted">{t("about.version", { commit, version })}</p>
          {builds ? (
            <ul className="mt-2 flex flex-col gap-0.5 font-mono text-sm text-muted">
              <li>{t("about.webBuild", { commit: builds.commit })}</li>
              {builds.mock ? <li>{t("about.mockBuild", { commit: builds.mock.commit })}</li> : null}
            </ul>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <CopyDiagnostics />
          <DialogClose asChild>
            <Button variant="secondary">{t("actions.close", { ns: "common" })}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
