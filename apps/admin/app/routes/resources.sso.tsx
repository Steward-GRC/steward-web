// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ssoGatewayProxy } from "@steward-web/auth/server";

import type { Route } from "./+types/resources.sso";

import { BASENAME } from "../basename";

/**
 * The gateway's SSO routes (start, callback, idp-initiated) on this app's own origin (#54): the
 * gateway runs SSO on the app's origin, so the browser reaches it here, through the app server.
 */
export const loader = ({ params, request }: Route.LoaderArgs) =>
  ssoGatewayProxy(request, params["*"] ?? "", { basename: BASENAME });

export const action = ({ params, request }: Route.ActionArgs) =>
  ssoGatewayProxy(request, params["*"] ?? "", { basename: BASENAME });
