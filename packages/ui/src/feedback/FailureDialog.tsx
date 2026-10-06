import { useTranslation } from "@steward-web/i18n";
import { type ReactNode } from "react";

import { Button } from "#ui/components/Button";
import { Dialog, DialogContent, DialogFooter } from "#ui/components/Overlays";

import type { Failure } from "./failure";

import { DiagnosticsSlot } from "./DiagnosticsSlot";

export interface FailureDialogProps {
  children?: ReactNode;
  failure?: Failure;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: ReactNode;
}

/** The failure variant of the dialog: it always carries Copy diagnostics. */
export const FailureDialog = ({
  children,
  failure,
  onOpenChange,
  open,
  title,
}: FailureDialogProps) => {
  const { t } = useTranslation("common");
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent role="alertdialog" size="sm" title={title}>
        {children ? <div className="text-base text-ink">{children}</div> : null}
        <DialogFooter className="justify-between">
          <DiagnosticsSlot failure={failure} />
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            {t("actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
