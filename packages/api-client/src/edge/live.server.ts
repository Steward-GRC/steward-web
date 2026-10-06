// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "../edge";

import { gatewayFetch } from "../gatewayFetch";
import { DiagnosticsDocument, MeDocument } from "../generated/graphql";

/** The live edge: every call is a real POST to `GATEWAY_URL`, cookie forwarded. */
export const liveEdge: Edge = {
  async diagnostics(cookie) {
    const data = await gatewayFetch(DiagnosticsDocument, {}, "Diagnostics", { cookie });
    return data.diagnostics;
  },
  async me(cookie) {
    const data = await gatewayFetch(MeDocument, {}, "Me", { cookie });
    return data.me ?? null; // scrub:allow=fqdn
  },
};

export default liveEdge;
