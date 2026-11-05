// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, Link, Outlet, useLoaderData } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { shouldRevalidateShell, useAccessRevalidation } from "./useAccessRevalidation";

/** A stand-in for the browser's EventSource with the surface the hook uses. */
class FakeEventSource {
  static instances: FakeEventSource[] = [];
  closed = false;
  readonly listeners = new Map<string, ((event: MessageEvent<string>) => void)[]>();
  readonly url: string;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  static latest(): FakeEventSource {
    const source = FakeEventSource.instances.at(-1);
    if (!source) throw new Error("expected an EventSource");
    return source;
  }

  addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data = "") {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new MessageEvent(type, { data }));
    }
  }

  removeEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((candidate) => candidate !== listener),
    );
  }
}

beforeEach(() => {
  FakeEventSource.instances = [];
  vi.stubGlobal("EventSource", FakeEventSource);
});
afterEach(() => vi.unstubAllGlobals());

const Shell = ({ signedIn }: { signedIn: boolean }) => {
  useAccessRevalidation(signedIn);
  return (
    <>
      <p>identity {useLoaderData<number>()}</p>
      <Link to="/other">Other page</Link>
      <Outlet />
    </>
  );
};

const mount = (signedIn = true) => {
  let loads = 0;
  const Stub = createRoutesStub([
    {
      children: [
        { Component: () => <p>home</p>, path: "/" },
        { Component: () => <p>other</p>, path: "/other" },
      ],
      Component: () => <Shell signedIn={signedIn} />,
      id: "root",
      loader: () => {
        loads += 1;
        return loads;
      },
      shouldRevalidate: shouldRevalidateShell,
    },
  ]);
  return render(<Stub />);
};

describe("useAccessRevalidation", () => {
  it("reloads the identity when the signed-in person's access changes", async () => {
    mount();
    expect(await screen.findByText("identity 1")).toBeInTheDocument();
    const source = FakeEventSource.latest();
    expect(source.url).toBe("/resources/live-access");

    act(() => source.emit("message", "access-changed"));
    expect(await screen.findByText("identity 2")).toBeInTheDocument();
  });

  it("stops listening when the gateway won't stream to this person", async () => {
    mount();
    expect(await screen.findByText("identity 1")).toBeInTheDocument();
    const source = FakeEventSource.latest();

    act(() => source.emit("unsupported", "refused"));
    expect(source.closed).toBe(true);
  });

  it("still reloads the identity on focus after the gateway refuses the stream", async () => {
    mount();
    expect(await screen.findByText("identity 1")).toBeInTheDocument();
    act(() => FakeEventSource.latest().emit("unsupported", "refused"));
    await vi.waitFor(() => {
      act(() => {
        globalThis.dispatchEvent(new Event("focus"));
      });
      expect(screen.getByText(/^identity [2-9]$/)).toBeInTheDocument();
    });
  });

  it("reloads the identity when the tab comes back into focus", async () => {
    mount();
    expect(await screen.findByText("identity 1")).toBeInTheDocument();
    await vi.waitFor(() => {
      act(() => {
        globalThis.dispatchEvent(new Event("focus"));
      });
      expect(screen.getByText(/^identity [2-9]$/)).toBeInTheDocument();
    });
  });

  it("opens no stream for a signed-out page", async () => {
    mount(false);
    expect(await screen.findByText("identity 1")).toBeInTheDocument();
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("closes the stream when the shell goes away", async () => {
    const { unmount } = mount();
    expect(await screen.findByText("identity 1")).toBeInTheDocument();
    const source = FakeEventSource.latest();
    unmount();
    expect(source.closed).toBe(true);
  });
});

describe("shouldRevalidateShell", () => {
  it("keeps the identity as it is when following a link", async () => {
    mount();
    expect(await screen.findByText("identity 1")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Other page" }));
    expect(await screen.findByText("other")).toBeInTheDocument();
    expect(screen.getByText("identity 1")).toBeInTheDocument();
  });

  it("reloads it after a form action", () => {
    const url = new URL("https://staff.example/");
    expect(
      shouldRevalidateShell({
        currentParams: {},
        currentUrl: url,
        defaultShouldRevalidate: true,
        formAction: "/settings",
        formMethod: "POST",
        nextParams: {},
        nextUrl: url,
      }),
    ).toBe(true);
  });
});
