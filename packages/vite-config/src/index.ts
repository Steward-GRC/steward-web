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

/** The Vite mode that builds an app against the mock gateway. Any other mode is live. */
export const MOCK_MODE = "mock";

/** True when this process is a `--mode mock` build or dev server. */
export const isMockRun = (argv: string[] = process.argv): boolean => {
  const index = argv.indexOf("--mode");
  return index !== -1 && argv[index + 1] === MOCK_MODE;
};

export interface EdgeChoice {
  /** The client component every app imports as `@steward-web/mock-banner`. */
  banner: string;
  mock: boolean;
  /** The server module every app imports as `@steward-web/edge.server`. */
  module: string;
}

/**
 * Pick the network edge (and its banner) for a build. The choice is made here, at build
 * time, from the Vite mode alone: `--mode mock` swaps in the mock gateway and its persistent
 * "MOCK DATA" banner, everything else is live. A STEWARD_MOCK variable on a live build is
 * refused, so a production build can't be talked into mock mode.
 */
export const chooseEdge = (
  mode: string,
  environment: NodeJS.ProcessEnv = process.env,
): EdgeChoice => {
  const mock = mode === MOCK_MODE;
  const flag = environment.STEWARD_MOCK;
  if (!mock && flag !== undefined && flag !== "" && flag !== "false") {
    throw new Error(
      `STEWARD_MOCK=${flag} is set for a "${mode}" build. Mock mode comes only from --mode mock.`,
    );
  }
  return {
    banner: mock
      ? path.join(source("mock-gateway"), "MockBanner.tsx")
      : path.join(source("shell"), "NoMockBanner.tsx"),
    mock,
    module: mock
      ? path.join(source("mock-gateway"), "edge.server.ts")
      : path.join(source("api-client"), "edge/live.server.ts"),
  };
};

export interface BuildInfo {
  commit: string;
  version: string;
}

const stamped = (value: string | undefined, fallback: string): string =>
  value && value.trim() !== "" ? value.trim() : fallback;

/** The app's own version and commit, from the image's VERSION and COMMIT build arguments. */
export const buildInfo = (environment: NodeJS.ProcessEnv = process.env): BuildInfo => ({
  commit: stamped(environment.COMMIT, "unknown"),
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

/** Aliases shared by every app and package: the package-internal prefixes, the edge and its banner. */
export const sharedAliases = (edge: EdgeChoice): Record<string, string> => ({
  "@steward-web/edge.server": edge.module,
  "@steward-web/mock-banner": edge.banner,
  "#api": source("api-client"),
  "#auth": source("auth"),
  "#i18n": source("i18n"),
  "#mock": source("mock-gateway"),
  "#shell": source("shell"),
  "#ui": source("ui"),
});

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
  resolve: { alias: sharedAliases(chooseEdge("test", {})) },
  test: testConfig(directory),
});
