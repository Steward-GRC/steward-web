// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import edge from "@steward-web/edge.server";

import { type Identity, identityFromMe, NO_ACCESS } from "./identity";

// React Router runs the root loader and every matched route's own loader in parallel for
// one request; each would otherwise call the gateway's `me` query again. Keyed on the
// `Request` object itself, so the cache never outlives the request it belongs to and never
// needs an explicit clear.
const cache = new WeakMap<Request, Promise<Identity>>();

/** The signed-in identity for this request, from its own cookie, fetched at most once. */
export const identityFromRequest = (request: Request): Promise<Identity> => {
  const cached = cache.get(request);
  if (cached) return cached;

  const cookie = request.headers.get("cookie") ?? undefined;
  const promise = edge
    .me(cookie)
    .then((me) => (me ? identityFromMe(me) : NO_ACCESS))
    .catch(() => NO_ACCESS);
  cache.set(request, promise);
  return promise;
};
