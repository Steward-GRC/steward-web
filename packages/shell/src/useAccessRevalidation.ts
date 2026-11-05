// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The browser half of live access (#7): the shell reloads the signed-in identity, and with it
// the menus, sidebar items and route guards, when that person's groups or permissions change.
import type { ShouldRevalidateFunctionArgs } from "react-router";

import { useEffect } from "react";
import { useRevalidator } from "react-router";

import { useLiveRevalidation } from "./useLiveRevalidation";

export const LIVE_ACCESS_PATH = "/resources/live-access";

/**
 * Listens on `resources/live-access` while someone is signed in and reloads the page's data,
 * the root's identity included, on each change to their access. The tab coming back into
 * focus reloads it too, which is all a person gets when the gateway won't stream to them.
 */
export const useAccessRevalidation = (signedIn: boolean) => {
  const { revalidate } = useRevalidator();
  useLiveRevalidation();

  useEffect(() => {
    if (!signedIn || typeof EventSource === "undefined") return;
    const source = new EventSource(LIVE_ACCESS_PATH);
    const onChange = () => void revalidate();
    const onUnsupported = () => source.close();
    source.addEventListener("message", onChange);
    source.addEventListener("unsupported", onUnsupported);
    return () => {
      source.removeEventListener("message", onChange);
      source.removeEventListener("unsupported", onUnsupported);
      source.close();
    };
  }, [revalidate, signedIn]);
};

/**
 * The root loader's rule. Following a link keeps the identity and banners as they are (a
 * round trip to the gateway on every click would be wasted). A form action reloads them, and
 * so does a revalidation of the page in place, which is how a change to the person's access,
 * or the tab regaining focus, reaches the shell.
 */
export const shouldRevalidateShell = ({
  currentUrl,
  formAction,
  nextUrl,
}: ShouldRevalidateFunctionArgs): boolean =>
  formAction != undefined || currentUrl.href === nextUrl.href;
