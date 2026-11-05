// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { UserConfig } from "vite";

import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svgr from "vite-plugin-svgr";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const source = (name: string) => path.join(root, "packages", name, "src");

export interface DevelopmentUiIssueChoice {
  enabled: boolean;
  /** The client component every app imports as `@steward-web/dev-ui-issue-button`. */
  module: string;
}

/**
 * Pick the dev UI-issue button's module at build time, from the `STEWARD_DEV_UI_ISSUE_COPY_BUILD`
 * variable (the `DEV_UI_ISSUE_COPY` Dockerfile build argument) alone: unset or anything but
 * `"true"` aliases in the no-op, so the real button's code never reaches a build made without
 * that argument.
 */
export const chooseDevelopmentUiIssueButton = (
  environment: NodeJS.ProcessEnv = process.env,
): DevelopmentUiIssueChoice => {
  const enabled = environment.STEWARD_DEV_UI_ISSUE_COPY_BUILD === "true";
  return {
    enabled,
    module: enabled
      ? path.join(source("shell"), "DevelopmentUiIssueButton.tsx")
      : path.join(source("shell"), "NoDevelopmentUiIssueButton.tsx"),
  };
};

export interface DevelopmentQuickLoginChoice {
  /** The client picker every sign-in route imports as `@steward-web/dev-quick-login`. */
  component: string;
  enabled: boolean;
  /** The dev gate preview (`?gate=`) imported as `@steward-web/dev-gate-preview.server`. */
  gatePreview: string;
  /** The server accounts reader imported as `@steward-web/dev-quick-login.server`. */
  module: string;
}

/**
 * Pick the dev quick login's modules at build time. It is allowed for the dev server
 * (`command === "serve"`) and for a build with `STEWARD_DEV_QUICK_LOGIN_BUILD=true` (the
 * `DEV_QUICK_LOGIN` Dockerfile build argument). Anything else aliases in the no-ops, so the users-file reader and the picker never
 * reach a release build. The server still has to turn it on at runtime
 * (`STEWARD_DEV_QUICK_LOGIN=true`). The dev gate preview (`?gate=` on the gates) comes and
 * goes with it, under the same build allowance.
 */
export const chooseDevelopmentQuickLogin = (
  command: "build" | "serve",
  environment: NodeJS.ProcessEnv = process.env,
): DevelopmentQuickLoginChoice => {
  const enabled = command === "serve" || environment.STEWARD_DEV_QUICK_LOGIN_BUILD === "true";
  return {
    component: enabled
      ? path.join(source("auth"), "QuickLogin.tsx")
      : path.join(source("auth"), "NoQuickLogin.tsx"),
    enabled,
    gatePreview: enabled
      ? path.join(source("auth"), "developmentGatePreview.server.ts")
      : path.join(source("auth"), "NoDevelopmentGatePreview.server.ts"),
    module: enabled
      ? path.join(source("auth"), "developmentQuickLogin.server.ts")
      : path.join(source("auth"), "NoDevelopmentQuickLogin.server.ts"),
  };
};

export interface BuildInfo {
  commit: string;
  version: string;
}

const stamped = (value: string | undefined, fallback: string): string =>
  value && value.trim() !== "" ? value.trim() : fallback;

/**
 * The app's own version and commit, from the image's VERSION and COMMIT build arguments. A
 * build with no COMMIT (a CI build outside the image) falls back to GitHub's `GITHUB_SHA`.
 */
export const buildInfo = (environment: NodeJS.ProcessEnv = process.env): BuildInfo => ({
  commit: stamped(environment.COMMIT, stamped(environment.GITHUB_SHA, "unknown")),
  version: stamped(environment.VERSION, "dev"),
});

/** The build info as Vite `define` entries, stamped into the bundle at build time. */
export const buildInfoDefines = (
  environment: NodeJS.ProcessEnv = process.env,
): Record<string, string> => {
  const info = buildInfo(environment);
  return {
    __STEWARD_COMMIT__: JSON.stringify(info.commit),
    __STEWARD_VERSION__: JSON.stringify(info.version),
  };
};

/**
 * Aliases shared by every app and package: the package-internal prefixes and the network edge.
 * The edge is always the live gateway client; mock data comes from steward-mock-server, which
 * the apps reach through GATEWAY_URL like any gateway.
 */
export const sharedAliases = (
  developmentUiIssue: DevelopmentUiIssueChoice = chooseDevelopmentUiIssueButton({}),
  developmentQuickLogin: DevelopmentQuickLoginChoice = chooseDevelopmentQuickLogin("build", {}),
): Record<string, string> => ({
  "@steward-web/dev-gate-preview.server": developmentQuickLogin.gatePreview,
  "@steward-web/dev-quick-login": developmentQuickLogin.component,
  "@steward-web/dev-quick-login.server": developmentQuickLogin.module,
  "@steward-web/dev-ui-issue-button": developmentUiIssue.module,
  "@steward-web/edge.server": path.join(source("api-client"), "edge/live.server.ts"),
  "#api": source("api-client"),
  "#auth": source("auth"),
  "#i18n": source("i18n"),
  "#shell": source("shell"),
  "#ui": source("ui"),
});

/**
 * The folder both apps serve as their Vite public directory: the designed favicons, touch icon,
 * and web manifest (decision 1-brand-and-voice.s6). One copy, so the two apps
 * can't drift apart.
 */
export const brandPublicDirectory = () => path.join(root, "packages", "ui", "public");

/** The rich-text editor imports its icons as React components (`*.svg?react`). */
export const editorPlugins = () => [svgr()];

/** Vitest settings for a package or an app: jsdom, globals and the shared setup file. */
export const testConfig = (directory: string) => ({
  css: false,
  environment: "jsdom",
  globals: true,
  include: ["{app,src}/**/*.test.{ts,tsx}"],
  root: directory,
  setupFiles: [path.join(here, "setupTests.ts")],
});

/** The Vitest config for a library package (no app entry). */
export const packageConfig = (
  directory: string,
): { test: ReturnType<typeof testConfig> } & UserConfig => ({
  define: buildInfoDefines({}),
  plugins: [react(), ...editorPlugins()],
  resolve: { alias: sharedAliases() },
  test: testConfig(directory),
});
