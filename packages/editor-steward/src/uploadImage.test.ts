// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImageUploadError, uploadEditorImage } from "./uploadImage";

const image = () => new File([new Uint8Array([1, 2, 3])], "logo.png", { type: "image/png" });

afterEach(() => vi.unstubAllGlobals());

describe("uploadEditorImage", () => {
  it("posts the file to /api/assets and answers the stored image's url", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      Response.json({ id: "a1", url: "/api/assets/a1" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    expect(await uploadEditorImage(image())).toBe("/api/assets/a1");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/assets");
    expect(init?.method).toBe("POST");
    expect(init?.credentials).toBe("same-origin");
    const sent = (init?.body as FormData).get("file") as File;
    expect(sent.name).toBe("logo.png");
    expect(sent.size).toBe(3);
  });

  it("throws the gateway's own text when it refuses the image", async () => {
    vi.stubGlobal("fetch", async () =>
      Response.json({ error: "File too large — max upload size is 10 MB" }, { status: 400 }),
    );
    const refused = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect(refused).toBeInstanceOf(ImageUploadError);
    expect((refused as ImageUploadError).gatewayText).toBe(
      "File too large — max upload size is 10 MB",
    );
  });

  it("throws with no gateway text when the answer has none, or the network is down", async () => {
    vi.stubGlobal("fetch", async () => new Response("<html>bad gateway</html>", { status: 502 }));
    const noText = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect(noText).toBeInstanceOf(ImageUploadError);
    expect((noText as ImageUploadError).gatewayText).toBeUndefined();
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("network down");
    });
    const down = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect(down).toBeInstanceOf(ImageUploadError);
    expect((down as ImageUploadError).gatewayText).toBeUndefined();
  });

  it("marks the refusal unavailable on a 503, with or without the code", async () => {
    vi.stubGlobal("fetch", async () =>
      Response.json(
        { code: "uploads_unavailable", error: "Uploads are unavailable right now." },
        { status: 503 },
      ),
    );
    const coded = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect(coded).toBeInstanceOf(ImageUploadError);
    expect((coded as ImageUploadError).unavailable).toBe(true);

    vi.stubGlobal("fetch", async () => new Response("<html>down</html>", { status: 503 }));
    const bare = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect((bare as ImageUploadError).unavailable).toBe(true);
  });

  it("marks the refusal unavailable on the code alone", async () => {
    vi.stubGlobal("fetch", async () =>
      Response.json({ code: "uploads_unavailable", error: "x" }, { status: 500 }),
    );
    const refused = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect((refused as ImageUploadError).unavailable).toBe(true);
  });

  it("does not mark other failures unavailable", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ error: "File too large" }, { status: 400 }));
    const refused = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect((refused as ImageUploadError).unavailable).toBe(false);
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("network down");
    });
    const down = await uploadEditorImage(image()).catch((error: unknown) => error);
    expect((down as ImageUploadError).unavailable).toBe(false);
  });

  it("throws when a success answer has no url", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ id: "a1" }));
    await expect(uploadEditorImage(image())).rejects.toBeInstanceOf(ImageUploadError);
  });
});
