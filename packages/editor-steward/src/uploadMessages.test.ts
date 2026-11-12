// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// bug log 195: every upload refusal reads as one clear sentence, whatever the server said.
import { describe, expect, it } from "vitest";

import { uploadRefusal } from "./uploadMessages";

describe("uploadRefusal", () => {
  it("says a file is too large, with the limit", () => {
    expect(uploadRefusal("File too large — max upload size is 10 MB")).toEqual({
      key: "editor.upload.tooLarge",
      values: { limit: "10 MB" },
    });
    expect(uploadRefusal("File too large or malformed upload — max upload size is 100 KB")).toEqual(
      { key: "editor.upload.tooLarge", values: { limit: "100 KB" } },
    );
  });

  it("says too large without a limit when the server gave none", () => {
    expect(uploadRefusal("File too large").key).toBe("editor.upload.tooLargeAny");
  });

  it("says a kind of file is not allowed, however the server worded it", () => {
    for (const raw of [
      "asset: files of this kind are not allowed (a web page, script or markup)",
      'asset: unsupported content type: "text/plain" (allowed: image/gif, image/jpeg)',
    ]) {
      expect(uploadRefusal(raw).key, raw).toBe("editor.upload.notAllowed");
    }
  });

  it("says the contents do not match the name, with the name", () => {
    expect(
      uploadRefusal('asset: the contents of "notes.png" do not match its name (found text/plain)'),
    ).toEqual({ key: "editor.upload.mismatch", values: { name: "notes.png" } });
  });

  it("says an empty file is empty", () => {
    expect(uploadRefusal("asset: empty upload").key).toBe("editor.upload.empty");
  });

  it("falls back to one general sentence, and never shows the server's own words", () => {
    for (const raw of ["Failed to store image", "something unexpected", undefined]) {
      expect(uploadRefusal(raw)).toEqual({ key: "editor.upload.failed", values: {} });
    }
  });

  it("says uploads are unavailable, in the file wording or the image wording", () => {
    expect(uploadRefusal("Uploads are unavailable right now.", { unavailable: true })).toEqual({
      key: "editor.upload.unavailable",
      values: {},
    });
    expect(uploadRefusal(undefined, { kind: "image", unavailable: true })).toEqual({
      key: "editor.upload.unavailableImage",
      values: {},
    });
  });

  it("keeps the other wording when not unavailable", () => {
    expect(uploadRefusal("asset: empty upload", { kind: "image" }).key).toBe("editor.upload.empty");
  });
});
