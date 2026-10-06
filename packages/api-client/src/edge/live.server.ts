// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Edge } from "../edge";

import { gatewayFetch } from "../gatewayFetch";
import {
  CategoriesDocument,
  DiagnosticsDocument,
  MeDocument,
  PoliciesDocument,
  UpdateMyProfileDocument,
} from "../generated/graphql";

/** The live edge: every call is a real POST to `GATEWAY_URL`, cookie forwarded. */
export const liveEdge: Edge = {
  async categories(cookie) {
    const data = await gatewayFetch(CategoriesDocument, {}, "Categories", { cookie });
    return data.categories;
  },
  async diagnostics(cookie) {
    const data = await gatewayFetch(DiagnosticsDocument, {}, "Diagnostics", { cookie });
    return data.diagnostics;
  },
  async me(cookie) {
    const data = await gatewayFetch(MeDocument, {}, "Me", { cookie });
    return data.me ?? null; // scrub:allow=fqdn
  },
  async policies(documentType, cookie) {
    const data = await gatewayFetch(PoliciesDocument, { documentType }, "Policies", { cookie });
    return data.policies;
  },
  async updateMyProfile(input, cookie) {
    const data = await gatewayFetch(UpdateMyProfileDocument, input, "UpdateMyProfile", { cookie });
    return data.updateMyProfile;
  },
};

export default liveEdge;
