// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { useId } from "react";

import { cn } from "#ui/lib/cn";

const PAGE = "M12 4h24a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5z";
const RIBBON = "M27 4h9v21l-4.5-4.2L27 25z";
const LINES =
  "M14 29.5h20a1.5 1.5 0 0 1 0 3H14a1.5 1.5 0 0 1 0-3zM14 35.5h13a1.5 1.5 0 0 1 0 3H14a1.5 1.5 0 0 1 0-3z";

/** Below this size the text lines drop out of the mark. */
export const SMALL_MARK_PX = 40;

export interface MarkProps {
  className?: string;
  /** Rendered size in pixels. The minimum is 16. */
  size?: number;
  /** A text alternative; omit it when the mark sits next to the word "Steward". */
  title?: string;
}

/**
 * The Bookmark mark: a plum page with a saffron ribbon and two text lines cut out of it.
 * The page takes the theme's primary colour, so it follows light, dark and high contrast.
 */
export const Mark = ({ className, size = 32, title }: MarkProps) => {
  const px = Math.max(16, size);
  const small = px < SMALL_MARK_PX;
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
      data-variant={small ? "small" : "full"}
      height={px}
      role={title ? "img" : undefined}
      viewBox="0 0 48 48"
      width={px}
    >
      <path
        d={small ? PAGE : `${PAGE}${LINES}`}
        fill="var(--primary)"
        fillRule={small ? undefined : "evenodd"}
      />
      <path d={RIBBON} fill="var(--accent)" />
    </svg>
  );
};

/** The horizontal lockup: the mark and "Steward" in Source Serif 4 Semibold. */
export const Lockup = ({ className, size = 28 }: { className?: string; size?: number }) => (
  <span className={cn("inline-flex items-center gap-2", className)}>
    <Mark size={size} />
    <span className="font-serif text-xl font-semibold text-ink" style={{ fontSize: size * 0.8 }}>
      Steward
    </span>
  </span>
);

/**
 * The loading mark (2.8 s loop): the page fills with plum, the lines type left to right, then
 * the ribbon drops. With reduced motion it's the complete mark plus "Loading…".
 */
export const Loader = ({
  className,
  label,
  size = 64,
}: {
  className?: string;
  /** What's loading, for screen readers: "Loading your work…". */
  label?: string;
  size?: number;
}) => {
  const { t } = useTranslation("common");
  const clip = useId();
  const text = label ?? t("status.loading");
  return (
    <div className={cn("grid justify-items-center gap-3", className)} role="status">
      <svg
        aria-hidden="true"
        className="motion-reduce:hidden"
        height={size}
        viewBox="0 0 48 48"
        width={size}
      >
        <defs>
          <clipPath id={clip}>
            <path d={PAGE} />
          </clipPath>
        </defs>
        <path d={PAGE} fill="none" stroke="var(--primary)" strokeOpacity=".35" strokeWidth="1.5" />
        <g className="stw-loader-g" clipPath={`url(#${clip})`}>
          <rect
            className="stw-loader-fill"
            fill="var(--primary)"
            height="40"
            width="48"
            x="0"
            y="4"
          />
          <path
            className="stw-loader-l1"
            d="M15.5 31h17"
            pathLength={1}
            stroke="var(--surface)"
            strokeDasharray="1 1"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            className="stw-loader-l2"
            d="M15.5 37h10"
            pathLength={1}
            stroke="var(--surface)"
            strokeDasharray="1 1"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path className="stw-loader-rib" d={RIBBON} fill="var(--accent)" />
        </g>
      </svg>
      <span className="hidden motion-reduce:inline">
        <Mark size={size} />
      </span>
      <span className="text-sm text-muted motion-safe:sr-only">{text}</span>
    </div>
  );
};
