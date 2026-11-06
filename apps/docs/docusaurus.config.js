// The Steward guide: a plain-language Docusaurus site. The brand colours and fonts in
// src/css/custom.css mirror packages/ui/src/styles/steward.css's design tokens (a lightweight
// Infima mapping, not an import of that package: Docusaurus's React and build pipeline are
// separate from the apps built on packages/ui).
const config = {
  baseUrl: "/",
  favicon: "img/mark.svg",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  markdown: {
    hooks: { onBrokenMarkdownLinks: "throw" },
  },
  onBrokenLinks: "throw",
  organizationName: "Steward-GRC",
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/Steward-GRC/steward-web/tree/main/apps/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],
  projectName: "steward-web",
  tagline: "A plain-language guide to policies, procedures and compliance",
  themeConfig: {
    navbar: {
      title: "Steward",
      logo: {
        alt: "The Steward mark",
        src: "img/mark.svg",
      },
      items: [
        { to: "/concepts", label: "Concepts", position: "left" },
        { to: "/user-guide", label: "User Guide", position: "left" },
        { to: "/admin-guide", label: "Admin Guide", position: "left" },
        { to: "/reference", label: "Reference", position: "left" },
        {
          href: "https://github.com/Steward-GRC/steward-web",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Guide",
          items: [
            { to: "/concepts", label: "Concepts" },
            { to: "/user-guide", label: "User Guide" },
            { to: "/admin-guide", label: "Admin Guide" },
            { to: "/reference", label: "Reference" },
          ],
        },
        {
          title: "Project",
          items: [
            { href: "https://github.com/Steward-GRC/steward-web", label: "steward-web" },
            { href: "https://steward-grc.com", label: "steward-grc.com" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Steward Authors. Apache-2.0.`,
    },
    prism: {
      additionalLanguages: ["bash", "json"],
    },
  },
  title: "Steward Guide",
  url: "https://steward-grc.com",
};
export default config;
