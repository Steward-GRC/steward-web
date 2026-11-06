// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A resource route (no UI) the inline review comments post to, from the approval page and the
// draft editor alike: start a thread, reply, resolve or reopen, delete.
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { data } from "react-router";

import type { Route } from "./+types/resources.review-threads";

import { changeReviewThread } from "../review/reviewThreads.server";

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  try {
    await changeReviewThread(request, await request.formData());
    return data({ ok: true });
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ ok: false }, { status: 422 });
  }
};
