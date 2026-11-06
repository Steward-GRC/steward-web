// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { draftPath } from "@steward-web/ui/domain";

/**
 * Where the reader posts `intent=edit` to start the working draft and open the editor, or
 * undefined when there is no Edit: the person must be able to edit this document and hold the
 * author role the editor's routes require.
 */
export const editActionOf = (
  detail: { canEdit?: boolean; number: string },
  isAuthor: boolean,
): string | undefined => (detail.canEdit && isAuthor ? draftPath(detail.number) : undefined);
