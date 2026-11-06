const sidebars = {
  docs: [
    "welcome",
    {
      items: [
        "concepts/what-is-a-policy",
        "concepts/lifecycle",
        "concepts/acknowledgement",
        "concepts/access-model",
      ],
      label: "Concepts",
      link: { type: "doc", id: "concepts/index" },
      type: "category",
    },
    {
      items: [
        "user-guide/signing-in",
        "user-guide/getting-around",
        "user-guide/your-dashboard",
        "user-guide/search",
        "user-guide/acknowledge",
        "user-guide/author-a-draft",
        "user-guide/review-and-approve",
        "user-guide/compliance-reporting",
        "user-guide/your-profile",
      ],
      label: "User Guide",
      link: { type: "doc", id: "user-guide/index" },
      type: "category",
    },
    {
      items: [
        "admin-guide/first-run-setup",
        "admin-guide/users-and-roles",
        "admin-guide/groups",
        "admin-guide/workflows",
        "admin-guide/organisations-and-sso",
        "admin-guide/audit-log",
      ],
      label: "Admin Guide",
      link: { type: "doc", id: "admin-guide/index" },
      type: "category",
    },
    {
      items: ["reference/glossary"],
      label: "Reference",
      link: { type: "doc", id: "reference/index" },
      type: "category",
    },
  ],
};
export default sidebars;
