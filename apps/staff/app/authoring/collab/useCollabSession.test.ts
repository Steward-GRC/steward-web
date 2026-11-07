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

  // Lexical draws a room's document only as it changes, so the editor has to be bound to the room
  // before the room's content arrives (bug log 171). The room is handed over while connecting.
  it("hands the editor its room while it is still connecting", async () => {
    const { result, unmount } = renderHook(() =>
      useCollabSession(
        "draft-1",
        callbacks(() => new Promise<never>(() => {})),
      ),
    );
    expect(result.current.mode).toBe("pending");
    await waitFor(() => expect(result.current.collaboration).not.toBeNull());
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
    expect(result.current.collaboration).toBeNull();
    unmount();
  });
});
