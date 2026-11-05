// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { COMING_SOON_PATHS } from "@steward-web/shell/coming-soon";

/** Each page's title (its i18n key), by route id; the root `meta` turns it into "<page> · Steward". */
export const PAGE_TITLES: Readonly<Record<string, string>> = {
  "routes/acknowledge": "shell:titles.staff.toAcknowledge",
  "routes/approvals": "shell:titles.staff.approvals",
  "routes/ask": "shell:titles.staff.ask",
  "routes/approvals.$number": "shell:titles.staff.review",
  "routes/drafts": "shell:titles.staff.drafts",
  "routes/drafts.$policyId": "shell:titles.staff.draft",
  "routes/drafts.new": "shell:titles.staff.newDraft",
  "routes/home": "shell:titles.staff.myWork",
  "routes/not-set-up": "shell:titles.staff.notSetUp",
  "routes/policies": "shell:titles.staff.policies",
  "routes/policy": "shell:titles.staff.policy",
  "routes/procedure": "shell:titles.staff.procedure",
  "routes/procedures": "shell:titles.staff.procedures",
  "routes/profile": "shell:titles.staff.profile",
  "routes/reporting.cases": "shell:titles.staff.cases",
  "routes/reporting.cases.$caseId": "shell:titles.staff.case",
  "routes/search": "shell:titles.staff.search",
  "routes/sign-in": "shell:titles.staff.signIn",
  "routes/share.$token": "shell:titles.staff.shared",
  "routes/sign-out": "shell:titles.staff.signOut",
  "routes/sso-test": "shell:titles.staff.ssoTest",
  "routes/sso-test.result": "shell:titles.staff.ssoTestResult",
  "routes/welcome": "shell:titles.staff.welcome",
  ...Object.fromEntries(
    COMING_SOON_PATHS.map((path) => [`coming-soon${path}`, "shell:titles.staff.comingSoon"]),
  ),
};
