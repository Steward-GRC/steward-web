// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PERMISSIONS, useCan } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { newDraftPath } from "@steward-web/shell";
import { Button } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { Upload } from "lucide-react";
import { useId } from "react";
import { Link, useSearchParams } from "react-router";

/**
 * The library header's author actions (U3, U4): Import (U21, CSV) and New policy or New
 * procedure. A reader gets neither, but sees New switched off with the reason.
 */
export const LibraryActions = ({ documentType }: { documentType: DocumentType }) => {
  const { t } = useTranslation("policy");
  const author = useCan(PERMISSIONS.PolicyAuthor);
  // A new draft started from a folder view opens on that category (#148).
  const [parameters] = useSearchParams();
  const reason = useId();
  const procedure = documentType === DocumentType.Procedure;
  // A reader isn't given the author actions, but the New button stays, switched off, with the
  // reason beside it, so it's never just missing (bug log 59).
  if (!author) {
    return (
      <span className="flex items-center gap-2.5">
        <span className="text-xs text-muted" id={reason}>
          {t(
            procedure
              ? "library.actions.needsAuthorProcedure"
              : "library.actions.needsAuthorPolicy",
          )}
        </span>
        <Button
          aria-describedby={reason}
          aria-disabled="true"
          className="h-[38px] px-4 opacity-50"
          type="button"
        >
          {t(procedure ? "library.actions.newProcedure" : "library.actions.newPolicy")}
        </Button>
      </span>
    );
  }
  return (
    <>
      <Button asChild className="h-[38px] px-3" variant="secondary">
        <Link to="/drafts/import">
          <Upload aria-hidden="true" />
          {t("library.actions.import")}
        </Link>
      </Button>
      <Button asChild className="h-[38px] px-4">
        <Link
          to={newDraftPath(documentType, {
            category: parameters.get("category") ?? "",
            subcategory: parameters.get("subcategory") ?? "",
          })}
        >
          {t(procedure ? "library.actions.newProcedure" : "library.actions.newPolicy")}
        </Link>
      </Button>
    </>
  );
};
