// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen } from "@testing-library/react";
import { createRoutesStub, useLoaderData } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useLiveRevalidation } from "./useLiveRevalidation";

afterEach(() => vi.useRealTimers());

const Page = () => {
  useLiveRevalidation(60_000);
  return <p>loads {useLoaderData<number>()}</p>;
};

const mount = () => {
  let loads = 0;
  const Stub = createRoutesStub([
    {
      Component: Page,
      loader: () => {
        loads += 1;
        return loads;
      },
      path: "/",
    },
  ]);
  render(<Stub />);
};

describe("useLiveRevalidation", () => {
  it("reloads the page's data when the window comes back into focus", async () => {
    mount();
    expect(await screen.findByText("loads 1")).toBeInTheDocument();
    act(() => {
      globalThis.dispatchEvent(new Event("focus"));
    });
    expect(await screen.findByText("loads 2")).toBeInTheDocument();
  });

  it("reloads it every interval", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mount();
    expect(await screen.findByText("loads 1")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60_000));
    expect(await screen.findByText("loads 2")).toBeInTheDocument();
  });
});
