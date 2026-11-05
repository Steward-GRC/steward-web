// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { PolicyStatus } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";

import { StatusPill } from "#ui/components/Badges";

import { documentStatusOf } from "./policy";

/**
 * A document's status pill. Rejected, superseded and withdrawn are history events, not pills
 * (4-components.s8), so those read as a plain muted word instead.
 */
export const DocumentStatusPill = ({ status }: { status: PolicyStatus }) => {
  const { t } = useTranslation("policy");
  const pill = documentStatusOf(status);
  if (pill) return <StatusPill status={pill} />;
  return <span className="text-sm text-muted">{t(`status.${status.toLowerCase()}`)}</span>;
};
