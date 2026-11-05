// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { DocumentType, type PolicyDetail } from "@steward-web/ui/domain";
import { useFetcher } from "react-router";

import type { GovernanceResult } from "./governance";

/** A governance action's fetcher, posting to the reader route's own action. */
export const useGovernanceFetcher = () => useFetcher<GovernanceResult>();

/** The fetcher's settled refusal, if its last answer was one. */
export const refusalIn = (fetcher: { data?: GovernanceResult; state: string }) =>
  fetcher.state === "idle" && fetcher.data && !fetcher.data.ok ? fetcher.data.failure : undefined;

/** The strings' {{noun}} and {{nounPlural}}: a policy's dialogs say "policy", a procedure's
 *  "procedure". */
export const useNouns = (detail: PolicyDetail) => {
  const { t } = useTranslation("admin");
  const kind = detail.documentType === DocumentType.Procedure ? "procedure" : "policy";
  return {
    noun: t(`governance.noun.${kind}`),
    nounPlural: t(`governance.nounPlural.${kind}`),
  };
};
