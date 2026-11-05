// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Reads a reference document for Generate with AI (U30.1): the browser posts the file here and
// the gateway turns it into text ("Read {n} characters"), or says why it couldn't.
import { GatewayError } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { data } from "react-router";

import type { Route } from "./+types/resources.documents.extract";

import { extractDocument } from "../authoring/ai.server";

export const action = async ({ request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return data({ ok: false as const, reason: null });
  try {
    const { content, title } = await extractDocument(request, file);
    return data({ characters: content.length, content, ok: true as const, title });
  } catch (error) {
    // The gateway's 400 bodies are written for the author ("Unsupported file type: …").
    const reason = error instanceof GatewayError && error.status === 400 ? error.message : null;
    return data({ ok: false as const, reason });
  }
};
