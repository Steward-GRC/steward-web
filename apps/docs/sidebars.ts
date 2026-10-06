// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "welcome",
    {
      type: "category",
      label: "Concepts",
      link: { type: "doc", id: "concepts/index" },
      items: [
        "concepts/what-is-a-policy",
        "concepts/lifecycle",
        "concepts/acknowledgement",
        "concepts/access-model",
      ],
    },
    {
      type: "category",
      label: "User Guide",
      link: { type: "doc", id: "user-guide/index" },
      items: [
        "user-guide/signing-in",
        "user-guide/your-dashboard",
        "user-guide/search",
        "user-guide/acknowledge",
        "user-guide/author-a-draft",
        "user-guide/review-and-approve",
        "user-guide/compliance-reporting",
      ],
    },
    {
      type: "category",
      label: "Admin Guide",
      link: { type: "doc", id: "admin-guide/index" },
      items: [
        "admin-guide/first-run-setup",
        "admin-guide/users-and-roles",
        "admin-guide/groups",
        "admin-guide/workflows",
        "admin-guide/organisations-and-sso",
        "admin-guide/audit-log",
      ],
    },
    {
      type: "category",
      label: "Reference",
      link: { type: "doc", id: "reference/index" },
      items: ["reference/glossary"],
    },
  ],
};

export default sidebars;
