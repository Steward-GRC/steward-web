// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

import { PERMISSIONS, useCan } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { newDraftPath } from "@steward-web/shell";
import { Button } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { Upload } from "lucide-react";
import { Link, useParams } from "react-router";

/**
 * The library header's author actions (U3, U4): Import (U21, CSV) and New policy or New
 * procedure. Someone without the author role gets nothing: no button, no message.
 */
export const LibraryActions = ({ documentType }: { documentType: DocumentType }) => {
  const { t } = useTranslation("policy");
  const author = useCan(PERMISSIONS.PolicyAuthor);
  // A new draft started from a folder view opens on that category (#148).
  const { category, deeper, subcategory } = useParams();
  const procedure = documentType === DocumentType.Procedure;
  // Someone without the author role is not shown the author actions at all (#148).
  if (!author) return null;
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
          to={newDraftPath(
            documentType,
            [category, subcategory, deeper].filter((slug): slug is string => slug !== undefined),
          )}
        >
          {t(procedure ? "library.actions.newProcedure" : "library.actions.newPolicy")}
        </Link>
      </Button>
    </>
  );
};
