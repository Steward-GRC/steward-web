// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { useRegisterCommandActions } from "@steward-web/ui";
import { useNavigate } from "react-router";

/** What the shell itself offers the command bar on every page: the inbox on Shift+I (Brigade's
 *  shell actions) and the list of shortcuts on ?. Create and ⌘K stay with the header search
 *  field. */
export const ShellActions = ({ inbox }: { inbox: boolean }) => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  useRegisterCommandActions([
    {
      allowed: inbox,
      id: "inbox",
      label: t("shortcuts.inbox"),
      run: () => void navigate("/inbox"),
      shortcut: "inbox",
    },
    {
      id: "shortcuts",
      label: t("shortcuts.shortcuts"),
      run: () => void navigate("/shortcuts"),
      shortcut: "shortcuts",
    },
  ]);
  return null;
};
