// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PERMISSIONS, useCan } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { COMING_SOON } from "@steward-web/shell/coming-soon";
import { Button } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { Upload } from "lucide-react";
import { Link } from "react-router";

/**
 * The library header's author actions (U3, U4): Import (U21, CSV) and New policy or New
 * procedure. A reader gets neither, as the brief says ("for authors").
 */
export const LibraryActions = ({ documentType }: { documentType: DocumentType }) => {
  const { t } = useTranslation("policy");
  const author = useCan(PERMISSIONS.PolicyAuthor);
  if (!author) return null;
  const procedure = documentType === DocumentType.Procedure;
  return (
    <>
      <Button asChild className="h-[38px] px-3" variant="secondary">
        <Link to={COMING_SOON.importPolicies}>
          <Upload aria-hidden="true" />
          {t("library.actions.import")}
        </Link>
      </Button>
      <Button asChild className="h-[38px] px-4">
        <Link to={`/drafts/new?type=${documentType}`}>
          {t(procedure ? "library.actions.newProcedure" : "library.actions.newPolicy")}
        </Link>
      </Button>
    </>
  );
};
