// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { type ReactNode, useEffect, useState } from "react";

import { cn } from "#ui/lib/cn";

const JUST_NOW_MS = 60_000;
/** The flash's length (the stored `stw-flash`, 1.2 s). A timer ends it, not `animationend`,
 *  which never fires when reduced motion turns the animation off. */
const FLASH_MS = 1200;

/**
 * Watches a value the page gets without reloading. When it changes after the first render, the
 * row should flash once (`flash`) and its card says "Updated just now" (`updatedAt`).
 */
export const useLiveUpdate = (value: unknown) => {
  const key = JSON.stringify(value);
  const [seen, setSeen] = useState(key);
  const [flash, setFlash] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<null | number>(null);
  // Adjusted during render, not in an effect, so the flash starts on the render that has the
  // new value.
  if (key !== seen) {
    setSeen(key);
    setFlash(true);
    setUpdatedAt(Date.now());
  }
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flash, updatedAt]);
  return { flash, updatedAt };
};

/** A row that flashes soft plum once (1.2 s) when `flash` turns on; reduced motion stills it. */
export const LiveRow = ({
  children,
  className,
  flash,
}: {
  children: ReactNode;
  className?: string;
  flash: boolean;
}) => <div className={cn(flash && "stw-updated", className)}>{children}</div>;

/** "Updated just now" in the card, for a minute after a live change. */
export const UpdatedJustNow = ({ at, className }: { at: null | number; className?: string }) => {
  const { t } = useTranslation("common");
  const [fresh, setFresh] = useState(at !== null);
  const [lastAt, setLastAt] = useState(at);
  if (at !== lastAt) {
    setLastAt(at);
    setFresh(at !== null);
  }
  useEffect(() => {
    if (at === null) return;
    const timer = setTimeout(() => setFresh(false), JUST_NOW_MS - (Date.now() - at));
    return () => clearTimeout(timer);
  }, [at]);
  return (
    <span className={cn("text-xs text-muted", className)} role="status">
      {fresh ? t("status.updatedJustNow") : null}
    </span>
  );
};
