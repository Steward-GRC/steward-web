// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Checks a reference URL for Generate with AI (U30.1): the gateway says whether it can read
// it ("Not readable" otherwise). Something that isn't a web address never reaches it.
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { data } from "react-router";

import type { Route } from "./+types/resources.documents.validate-url";

import { validateReferenceUrl } from "../authoring/ai.server";

const isWebAddress = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".");
  } catch {
    return false;
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const form = await request.formData();
  const url = String(form.get("url") ?? "").trim();
  if (!isWebAddress(url)) return data({ malformed: true as const, ok: false as const, url });
  try {
    const check = await validateReferenceUrl(request, url);
    return data({ ok: true as const, readable: check.readable, url });
  } catch {
    return data({ ok: true as const, readable: false, url });
  }
};
