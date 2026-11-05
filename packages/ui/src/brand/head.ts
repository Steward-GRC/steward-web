// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/**
 * The designed favicons, touch icon and web manifest (design assets/web/head-snippet.html,
 * decision 1-brand-and-voice.s6). The files live in `packages/ui/public`, which both apps serve
 * as their Vite public folder; `base` is the app's base path ("/admin/" for admin).
 */
export const brandLinks = (base = "/") => [
  { href: `${base}favicon.ico`, rel: "icon", sizes: "48x48" },
  { href: `${base}favicon.svg`, rel: "icon", type: "image/svg+xml" },
  { href: `${base}apple-touch-icon.png`, rel: "apple-touch-icon" },
  { href: `${base}site.webmanifest`, rel: "manifest" },
];

/** The browser chrome colour: plum, and night when the system is dark. */
export const brandMeta = () => [
  { content: "#5D2A5B", media: "(prefers-color-scheme: light)", name: "theme-color" },
  { content: "#1D1520", media: "(prefers-color-scheme: dark)", name: "theme-color" },
];
