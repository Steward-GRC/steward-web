// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/**
 * An image upload that didn't store. `gatewayText` is the gateway's own refusal text (too large,
 * not an allowed image) when it gave one, for the image card to show; without it the card shows
 * its own "couldn't upload" line. `unavailable` is set when the gateway's object store is off or
 * down (HTTP 503, or the code `uploads_unavailable`): retrying will not help, so the card says
 * uploads are unavailable instead of "try again".
 */
export class ImageUploadError extends Error {
  readonly gatewayText: string | undefined;
  readonly unavailable: boolean;

  constructor(gatewayText?: string, unavailable = false) {
    super(gatewayText ?? "image upload failed");
    this.name = "ImageUploadError";
    this.gatewayText = gatewayText;
    this.unavailable = unavailable;
  }
}

/**
 * Stores an editor image through steward-gateway's `POST /api/assets` (multipart, the file under
 * `file`) and answers the URL to embed, `/api/assets/{id}`. The call is same-origin: the web
 * server's asset proxy adds the session's CSRF token, so the browser never holds it. This is the
 * one upload call, the same against the mock and the real object store.
 */
export const uploadEditorImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.set("file", file, file.name);
  let answer: Response;
  try {
    answer = await fetch("/api/assets", { body: form, credentials: "same-origin", method: "POST" });
  } catch {
    throw new ImageUploadError();
  }
  const body: unknown = await answer.json().catch(() => ({}));
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  if (!answer.ok) {
    const unavailable = answer.status === 503 || record.code === "uploads_unavailable";
    throw new ImageUploadError(
      typeof record.error === "string" ? record.error : undefined,
      unavailable,
    );
  }
  if (typeof record.url !== "string" || record.url === "") throw new ImageUploadError();
  return record.url;
};
