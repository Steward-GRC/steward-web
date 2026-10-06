// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useFavorites } from "./favorites";

beforeEach(() => {
  localStorage.clear();
});

describe("useFavorites", () => {
  it("starts empty, then hydrates from localStorage after mount", async () => {
    localStorage.setItem("steward:library.favorites", JSON.stringify(["POL-1"]));
    const { result } = renderHook(() => useFavorites());

    await waitFor(() => expect(result.current.favorites).toEqual(["POL-1"]));
    expect(result.current.isFavorite("POL-1")).toBe(true);
    expect(result.current.isFavorite("POL-2")).toBe(false);
  });

  it("toggles a number on and off, persisting each change", async () => {
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.favorites).toEqual([]));

    act(() => result.current.toggle("POL-1"));
    await waitFor(() => expect(result.current.isFavorite("POL-1")).toBe(true));
    expect(JSON.parse(localStorage.getItem("steward:library.favorites") ?? "[]")).toEqual([
      "POL-1",
    ]);

    act(() => result.current.toggle("POL-1"));
    await waitFor(() => expect(result.current.isFavorite("POL-1")).toBe(false));
    expect(JSON.parse(localStorage.getItem("steward:library.favorites") ?? "[]")).toEqual([]);
  });

  it("ignores a corrupt stored value instead of throwing", async () => {
    localStorage.setItem("steward:library.favorites", "not json");
    const { result } = renderHook(() => useFavorites());
    await waitFor(() => expect(result.current.favorites).toEqual([]));
  });
});
