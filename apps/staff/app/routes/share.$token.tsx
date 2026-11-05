// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { SharedLinkState } from "@steward-web/auth";

import { sharedLinkPreview } from "@steward-web/dev-gate-preview.server";
import {
  SharedEmailPrompt,
  SharedLinkRefused,
  SharedPolicyReader,
  SharedUnavailable,
} from "@steward-web/shell";
import { useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../root";
import type { Route } from "./+types/share.$token";

// G16 opens without signing in, outside the app shell (decision 2-layout-and-navigation.s5).
export { GATE_HANDLE as handle } from "@steward-web/shell";

/**
 * A shared link (G16). steward-gateway has no public share-link lookup yet
 * (Steward-GRC/steward-gateway#53), so every link answers "unavailable" until it does. In a dev
 * build, `?gate=G16` (and `G16-revoked`, `G16-expired`, `G16-email`) shows each state.
 */
export const loader = ({ request }: Route.LoaderArgs): SharedLinkState =>
  sharedLinkPreview(new URL(request.url)) ?? { view: "unavailable" };

/** The sensitive-policy email; it has nowhere to go until the gateway's lookup exists. */
export const action = (): SharedLinkState => ({ view: "unavailable" });

export default function SharedRoute({ actionData, loaderData }: Route.ComponentProps) {
  const root = useRouteLoaderData<typeof rootLoader>("root");
  const state = actionData ?? loaderData;
  switch (state.view) {
    case "email": {
      return <SharedEmailPrompt />;
    }
    case "expired": {
      return <SharedLinkRefused expiredAt={state.expiredAt} reason="expired" />;
    }
    case "policy": {
      return (
        <SharedPolicyReader organisation={root?.shell.config.organisation} policy={state.policy} />
      );
    }
    case "revoked": {
      return <SharedLinkRefused reason="revoked" />;
    }
    case "unavailable": {
      return <SharedUnavailable />;
    }
  }
}
