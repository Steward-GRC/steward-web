// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A resource route (no UI): the new-organisation form's metadata-import assist posts here
// via a fetcher, prefilling the SAML fields without navigating away from the form.
import { refusalOf } from "@steward-web/shell";
import { data } from "react-router";

import type { Route } from "./+types/resources.idp-metadata";

import {
  fetchIdpCertFromUrl,
  importIdpMetadataFromUrl,
  parseIdpMetadataFile,
} from "../organisations/organisations.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "fetch-cert": {
        const certificatePem = await fetchIdpCertFromUrl(request, String(form.get("url") ?? ""));
        return data({ certificatePem, intent, ok: true } as const);
      }
      case "import-url": {
        const metadata = await importIdpMetadataFromUrl(request, String(form.get("url") ?? ""));
        return data({ intent, metadata, ok: true } as const);
      }
      case "parse-file": {
        const file = form.get("metadata");
        const xml = file instanceof File ? await file.text() : String(file ?? "");
        const metadata = await parseIdpMetadataFile(request, xml);
        return data({ intent, metadata, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ failure: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};
