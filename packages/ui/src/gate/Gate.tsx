// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ComponentProps, ReactNode } from "react";

import { useTranslation } from "@steward-web/i18n";
import { XCircle } from "lucide-react";

import { Mark } from "#ui/brand/Mark";
import { Wordmark } from "#ui/brand/Wordmark";
import { initialsOf } from "#ui/components/Display";
import { cn } from "#ui/lib/cn";

/**
 * The gate page (Gates canvas, "one gate layout"): the sunken background with the card centred
 * on it, outside the app shell. On a phone the card goes full width between 16 px gutters and
 * sits 60 px from the top (G3m); from 640 px up it is centred both ways.
 */
export const GatePage = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn(
      "flex flex-1 flex-col items-center gap-4 bg-sunken px-4 pt-[60px] pb-16 text-base text-ink sm:justify-center sm:gap-[14px] sm:py-10",
      className,
    )}
    data-testid="gate-page"
  >
    {children}
  </div>
);

export interface GateCardProps extends ComponentProps<"section"> {
  /**
   * "sign-in" is G3's card: 28 px padding and 14 px between rows, 20 and 12 on a phone (G3m).
   * "small" is the other gates' card (G1, G2, G4, G7–G9, G12): 22 px padding, 10 px rows.
   */
  size?: "sign-in" | "small";
}

/**
 * The gate card: 400 px wide on the surface, a 1 px border, 14 px corners and shadow 3. On a
 * phone it fills the width; G3m draws it without the shadow.
 */
export const GateCard = ({ className, size = "small", ...props }: GateCardProps) => (
  <section
    className={cn(
      "box-border flex w-full max-w-[400px] flex-col rounded-[14px] border border-border bg-surface shadow-3",
      size === "sign-in" ? "gap-3 p-5 max-sm:shadow-none sm:gap-[14px] sm:p-7" : "gap-2.5 p-[22px]",
      className,
    )}
    {...props}
  />
);

/**
 * "Steward" at the top of a small gate card: the 22 px mark beside the outlined wordmark at
 * 17 px type. It names itself once for screen readers.
 */
export const GateBrand = ({ className }: { className?: string }) => {
  const { t } = useTranslation("shell");
  return (
    <span
      aria-label={t("brand.name")}
      className={cn("inline-flex items-center gap-2 text-ink", className)}
      role="img"
    >
      <Mark size={22} variant="full" />
      <Wordmark fontSize={17} />
    </span>
  );
};

/**
 * The organisation slot on a gate (G3): the organisation's 44 px tile and its name in 16 px
 * bold. There's no logo setting yet, so the tile shows the name's initials, as the canvas
 * draws it.
 */
export const GateOrganisation = ({ name }: { name: string }) => (
  <>
    <span
      aria-hidden="true"
      className="flex size-11 items-center justify-center rounded-lg bg-sunken text-sm font-semibold text-muted"
    >
      {initialsOf(name)}
    </span>
    <b className="text-md font-bold">{name}</b>
  </>
);

/**
 * A gate's error: calm red on danger-soft with the x-circle, inline above the fields (G3). Its
 * id lets the field it is about point at it with aria-describedby.
 */
export const GateAlert = ({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger",
      className,
    )}
    id={id}
    role="alert"
  >
    <XCircle aria-hidden="true" className="size-[1.15em] flex-none" />
    <span>{children}</span>
  </div>
);
