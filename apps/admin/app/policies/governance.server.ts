// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import edge from "@steward-web/edge.server";
import { refusalOf } from "@steward-web/shell";

import type { GovernanceResult } from "./governance";

/** What the governance actions need to know about the open policy, read on the server. */
export interface GovernedDocument {
  /** The published version an export or a magic link is made from; null before the first
   *  publish. */
  currentVersionId?: null | string;
  id: string;
  sensitive: boolean;
}

/** The gateway's answer while a PDF is still rendering (steward-delivery 8010). */
const NOT_READY = "PDF_EXPORT_NOT_READY";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

/** The link a magic link's token opens: the staff app's shared policy reader (G16), at
 *  `/share/:token`. */
const shareUrl = (token: string, staffUrl: string, request: Request) =>
  new URL(`share/${encodeURIComponent(token)}`, new URL(staffUrl, request.url)).href;

/** An export or a link shares the published version, so a never-published one has neither. */
const publishedVersion = (document: GovernedDocument) => {
  if (!document.currentVersionId) {
    throw Object.assign(new Error("not published"), { code: "NOT_PUBLISHED", status: 409 });
  }
  return document.currentVersionId;
};

const issue = async (
  document: GovernedDocument,
  staffUrl: string,
  request: Request,
  cookie?: string,
) => {
  // The policy's own sensitivity decides whether the link asks for an email first, never a
  // value from the form.
  const link = await edge.createMagicLink(publishedVersion(document), document.sensitive, cookie);
  return { ...link, url: shareUrl(link.token, staffUrl, request) };
};

/**
 * The admin reader's governance actions (A11): change author (D5), move to section (D6),
 * retire (D10), delete (D4), export a PDF (D16) and the magic links (D31). The policy's ids
 * come from the server's own read of it; the form only says what to do.
 */
export const runGovernance = async ({
  document,
  form,
  request,
  staffUrl,
}: {
  document: GovernedDocument;
  form: FormData;
  request: Request;
  staffUrl: string;
}): Promise<GovernanceResult> => {
  const cookie = request.headers.get("cookie") ?? undefined;
  const intent = field(form, "intent");
  try {
    switch (intent) {
      case "changeAuthor": {
        await edge.setPolicyOwner(document.id, field(form, "ownerUserId"), cookie);
        return { intent, ok: true };
      }
      case "createMagicLink": {
        return { intent, ok: true, ...(await issue(document, staffUrl, request, cookie)) };
      }
      case "delete": {
        await edge.deletePolicy(document.id, cookie);
        return { intent, ok: true };
      }
      case "exportPdf": {
        const { jobId } = await edge.requestPdfExport(publishedVersion(document), cookie);
        return { intent, jobId, ok: true };
      }
      case "move": {
        const moved = await edge.movePolicy(document.id, field(form, "homeCategoryId"), cookie);
        return { intent, number: moved.number, ok: true };
      }
      case "pdfLink": {
        try {
          const { signedUrl } = await edge.pdfDownloadLink(field(form, "jobId"), cookie);
          return { intent, ok: true, pending: false, signedUrl };
        } catch (error) {
          if (refusalOf(error).code === NOT_READY) return { intent, ok: true, pending: true };
          throw error;
        }
      }
      case "reissueMagicLink": {
        const replaced = field(form, "token");
        await edge.revokeMagicLink(replaced, cookie);
        return {
          intent,
          ok: true,
          replaced,
          ...(await issue(document, staffUrl, request, cookie)),
        };
      }
      case "retire": {
        await edge.retirePolicy(document.id, cookie);
        return { intent, ok: true };
      }
      case "revokeMagicLink": {
        const token = field(form, "token");
        await edge.revokeMagicLink(token, cookie);
        return { intent, ok: true, token };
      }
      default: {
        throw new Response("Bad Request", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    return { failure: refusalOf(error), intent, ok: false };
  }
};
