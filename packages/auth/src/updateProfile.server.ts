// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import edge from "@steward-web/edge.server";

import { type Identity, identityFromMe } from "./identity";

export interface UpdateMyProfileInput {
  firstName: string;
  lastName: string;
}

/**
 * Edits the calling request's own name. The actor is the session's own cookie — there is no
 * userId argument, by design (see `@steward-web/api-client`'s `Edge.updateMyProfile`). Rejects
 * with `GatewayError` (never swallowed, unlike `identityFromRequest`): the caller's route
 * action needs to know a save failed so it can show the error.
 */
export const updateMyProfile = async (
  request: Request,
  input: UpdateMyProfileInput,
): Promise<Identity> => {
  const cookie = request.headers.get("cookie") ?? undefined;
  const me = await edge.updateMyProfile(input, cookie);
  return identityFromMe(me);
};
