// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useId } from "react";

import { cn } from "#ui/lib/cn";

/** The star's outline, from the 24px icon set the app already uses. */
const STAR =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

/**
 * The one star for a starred item (#152): a filled gold star with depth (a light-to-dark gold
 * fill, a darker edge and a soft shadow) when starred, an outline in the current colour when
 * not. The policy list and the reader both draw it, so the two never drift apart. The gold is
 * fixed, not a theme token, so a starred item reads the same in every theme; it is decoration,
 * and the button around it carries the name and the pressed state.
 */
export const FavoriteStar = ({ className, starred }: { className?: string; starred: boolean }) => {
  const gradient = useId();
  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0", className)}
      data-starred={starred}
      data-testid="favorite-star"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={starred ? 1.25 : 2}
      style={starred ? { filter: "drop-shadow(0 1.5px 1px rgb(120 80 0 / 0.45))" } : undefined}
      viewBox="0 0 24 24"
    >
      {starred ? (
        <>
          <linearGradient id={gradient} x1="0" x2="0.35" y1="0" y2="1">
            <stop offset="0" stopColor="#ffe27a" />
            <stop offset="0.55" stopColor="#f5b800" />
            <stop offset="1" stopColor="#c98a00" />
          </linearGradient>
          <path d={STAR} fill={`url(#${gradient})`} stroke="#a86f00" />
        </>
      ) : (
        <path d={STAR} fill="none" />
      )}
    </svg>
  );
};
