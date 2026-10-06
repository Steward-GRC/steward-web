// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCollabSession } from "./useCollabSession";

const callbacks = (getToken: () => Promise<never>) => ({
  getContentJSON: () => '{"root":{"children":[{"type":"paragraph"}],"type":"root"}}',
  getToken,
});

describe("useCollabSession", () => {
  it("edits alone when there is no draft", () => {
    const { result } = renderHook(() =>
      useCollabSession(
        null,
        callbacks(() => Promise.reject(new Error("unused"))),
      ),
    );
    expect(result.current.mode).toBe("solo");
    expect(result.current.collaboration).toBeNull();
  });

  it("waits for the room before mounting the editor", () => {
    const { result, unmount } = renderHook(() =>
      useCollabSession(
        "draft-1",
        callbacks(() => new Promise<never>(() => {})),
      ),
    );
    expect(result.current.mode).toBe("pending");
    unmount();
  });

  it("falls back to editing alone when no token can be minted", async () => {
    const { result, unmount } = renderHook(() =>
      useCollabSession(
        "draft-1",
        callbacks(() => Promise.reject(new Error("refused"))),
      ),
    );
    await waitFor(() => expect(result.current.mode).toBe("solo"));
    expect(result.current.collaboration).toBeNull();
    unmount();
  });

  it("stops waiting and edits alone when the room doesn't answer in time", async () => {
    const { result, unmount } = renderHook(() =>
      useCollabSession(
        "draft-1",
        callbacks(() => new Promise<never>(() => {})),
        10,
      ),
    );
    await waitFor(() => expect(result.current.mode).toBe("solo"));
    unmount();
  });
});
