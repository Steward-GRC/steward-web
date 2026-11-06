// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { useId, useState } from "react";

import { Button } from "#ui/components/Button";
import { Checkbox } from "#ui/components/Controls";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "#ui/components/Overlays";

const storageKey = (viewer: string) => `steward.print.history:${viewer}`;

/** Whether this person last chose to print the version-history page; off until they do. */
export const rememberedHistoryChoice = (viewer = ""): boolean => {
  try {
    return localStorage.getItem(storageKey(viewer)) === "1";
  } catch {
    return false;
  }
};

const rememberHistoryChoice = (viewer: string, include: boolean) => {
  try {
    localStorage.setItem(storageKey(viewer), include ? "1" : "0");
  } catch {
    // Private windows and blocked storage just forget the choice.
  }
};

export interface PrintDialogProps {
  onOpenChange: (open: boolean) => void;
  /** Called with the choice when the person confirms; the caller prints. */
  onPrint: (options: { includeHistory: boolean }) => void;
  open: boolean;
  viewerName?: string;
}

/** The choices before printing: for now, whether to add the version-history page (#30). */
export const PrintDialog = ({ onOpenChange, onPrint, open, viewerName = "" }: PrintDialogProps) => (
  <Dialog onOpenChange={onOpenChange} open={open}>
    {open ? <PrintChoices onPrint={onPrint} viewerName={viewerName} /> : null}
  </Dialog>
);

const PrintChoices = ({
  onPrint,
  viewerName,
}: Pick<PrintDialogProps, "onPrint"> & { viewerName: string }) => {
  const { t } = useTranslation("policy");
  const [include, setInclude] = useState(() => rememberedHistoryChoice(viewerName));
  const id = useId();
  return (
    <DialogContent description={t("reader.printDialog.description")} title={t("reader.printDialog.title")}>
      <DialogBody>
        <label className="flex items-center gap-2.5" htmlFor={id}>
          <Checkbox
            checked={include}
            id={id}
            onCheckedChange={(next) => setInclude(next === true)}
          />
          {t("reader.printDialog.includeHistory")}
        </label>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">{t("reader.printDialog.cancel")}</Button>
        </DialogClose>
        <Button
          onClick={() => {
            rememberHistoryChoice(viewerName, include);
            onPrint({ includeHistory: include });
          }}
        >
          {t("reader.printDialog.print")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
