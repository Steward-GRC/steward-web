// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { GlobalSettings } from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

/**
 * The announcement and maintenance settings for this request's banners (#112), read once in
 * each app's root loader. `globalSettings` is one of the gateway's public operations, so a
 * signed-out request (the sign-in page) gets them too. A failed read answers null: a banner
 * is never worth failing the page over.
 */
export const siteSettingsFromRequest = async (request: Request): Promise<GlobalSettings | null> => {
  try {
    return await edge.globalSettings(request.headers.get("cookie") ?? undefined);
  } catch {
    return null;
  }
};
