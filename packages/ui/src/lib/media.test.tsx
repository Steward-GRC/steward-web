// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PHONE, useMediaQuery } from "./media";

const restore = globalThis.matchMedia;
afterEach(() => {
  globalThis.matchMedia = restore;
});

/** A screen whose width can change, as the browser's media query list reports it. */
const screenOf = (phone: boolean) => {
  const listeners = new Set<() => void>();
  const state = { phone };
  globalThis.matchMedia = ((query: string) => ({
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    get matches() {
      return query === PHONE && state.phone;
    },
    media: query,
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof globalThis.matchMedia;
  return (next: boolean) => {
    state.phone = next;
    for (const listener of listeners) listener();
  };
};

const Probe = () => <p>{useMediaQuery(PHONE) ? "phone" : "wide"}</p>;

describe("useMediaQuery", () => {
  it("answers whether the query matches, and follows the screen as it changes", () => {
    const resize = screenOf(true);
    render(<Probe />);
    expect(screen.getByText("phone")).toBeInTheDocument();
    act(() => resize(false));
    expect(screen.getByText("wide")).toBeInTheDocument();
  });
});
