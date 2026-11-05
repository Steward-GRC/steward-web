// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";
import type { ReactNode } from "react";

import { useMatches } from "react-router";

import { AccessibilityButton } from "./AccessibilityButton";
import { EnvironmentBanner } from "./EnvironmentBanner";
import { SiteBanners } from "./SiteBanners";

/** A gate route's `handle`: sign-in and the other gates render outside the app shell. */
export const GATE_HANDLE = { gate: true } as const;

/** Whether the current page is a gate, from the matched routes' handles. */
export const useIsGate = (): boolean =>
  useMatches().some((match) => (match.handle as { gate?: boolean } | undefined)?.gate === true);

export interface GateShellProps {
  /** The site's announcement and maintenance settings, from the app's root loader. */
  banners?: GlobalSettings | null;
  children: ReactNode;
  /** A non-production environment's name for the banner (H4), or null in production. */
  environment: null | string;
}

/**
 * The frame around a gate (Gates canvas; decision 2-layout-and-navigation.s5): no header,
 * navigation or footer, only the sunken page with its centred card. It keeps what every page
 * carries: the environment banner, the site's announcement (BRIEF H5 shows it on sign-in) and
 * the floating accessibility button.
 */
export const GateShell = ({ banners, children, environment }: GateShellProps) => (
  <div className="flex min-h-dvh flex-col bg-sunken">
    <EnvironmentBanner name={environment} />
    <SiteBanners settings={banners} />
    <main className="flex flex-1 flex-col">{children}</main>
    <AccessibilityButton />
  </div>
);
