// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Dialog, MenuItem } from "@steward-web/ui";
import { type PolicyDetail, PolicyReader } from "@steward-web/ui/domain";
import { Archive, ArrowRightLeft, FileDown, Link2, Trash2, UserRound } from "lucide-react";
import { useCallback, useState } from "react";

import type { GovernanceDialog } from "./governance";

import { ChangeAuthorDialog } from "./ChangeAuthorDialog";
import { ExportPdfDialog } from "./ExportPdfDialog";
import { MagicLinkSheet } from "./MagicLinkSheet";
import { MoveDialog } from "./MoveDialog";
import { DeleteDialog, RetireDialog } from "./RemoveDialogs";

export interface AdminPolicyReaderProps {
  detail: PolicyDetail;
  /** Change author and Move to section are the gateway's site-admin-only actions. */
  isSiteAdmin: boolean;
  organisation?: null | string;
  viewerName?: string;
}

/**
 * The admin policy detail (A11): the staff reader (U7) with the governance group in its Actions
 * menu: Export PDF (D16), Magic link (D31), Change author (D5), Move to section (D6), Retire
 * (D10) and Delete (D4). Each opens its dialog; the route's action does the work.
 */
export const AdminPolicyReader = ({
  detail,
  isSiteAdmin,
  organisation,
  viewerName,
}: AdminPolicyReaderProps) => {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState<GovernanceDialog | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const published = Boolean(detail.currentVersionId);

  const item = (dialog: GovernanceDialog, Icon: typeof FileDown, disabled = false) => (
    <MenuItem disabled={disabled} onSelect={() => setOpen(dialog)}>
      <Icon aria-hidden="true" className="size-4" />
      {t(`governance.menu.${dialog}`)}
    </MenuItem>
  );

  const governance = (
    <>
      {item("exportPdf", FileDown, !published)}
      {item("magicLinks", Link2)}
      {isSiteAdmin ? item("changeAuthor", UserRound) : null}
      {isSiteAdmin ? item("move", ArrowRightLeft) : null}
      {item("retire", Archive)}
      {item("delete", Trash2)}
    </>
  );

  const dialog = (name: Exclude<GovernanceDialog, "magicLinks">) => ({
    onOpenChange: (next: boolean) => setOpen(next ? name : null),
    open: open === name,
  });

  return (
    <>
      <PolicyReader
        detail={detail}
        governance={governance}
        organisation={organisation}
        viewerName={viewerName}
      />
      <Dialog {...dialog("exportPdf")}>
        {open === "exportPdf" ? <ExportPdfDialog detail={detail} /> : null}
      </Dialog>
      <MagicLinkSheet
        detail={detail}
        onOpenChange={(next) => setOpen(next ? "magicLinks" : null)}
        open={open === "magicLinks"}
        viewerName={viewerName ?? ""}
      />
      <Dialog {...dialog("changeAuthor")}>
        {open === "changeAuthor" ? <ChangeAuthorDialog detail={detail} onDone={close} /> : null}
      </Dialog>
      <Dialog {...dialog("move")}>
        {open === "move" ? <MoveDialog detail={detail} onDone={close} /> : null}
      </Dialog>
      <Dialog {...dialog("retire")}>
        {open === "retire" ? <RetireDialog detail={detail} /> : null}
      </Dialog>
      <Dialog {...dialog("delete")}>
        {open === "delete" ? <DeleteDialog detail={detail} /> : null}
      </Dialog>
    </>
  );
};
