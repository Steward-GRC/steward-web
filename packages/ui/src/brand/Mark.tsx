// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { useId } from "react";

import { cn } from "#ui/lib/cn";

import { Wordmark } from "./Wordmark";

const PAGE = "M12 4h24a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5z";
const RIBBON = "M27 4h9v21l-4.5-4.2L27 25z";
/** High contrast cuts a keyline around the ribbon out of the page (assets/steward-mark-hc.svg). */
const RIBBON_KEYLINE = "M25.5 4h12v24.3l-6-5.5-6 5.5z";
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
  /** "on-dark" is the lilac page for the ink admin header (assets/steward-mark-on-dark.svg). */
  tone?: "default" | "on-dark";
  /**
   * "small" drops the text lines. By default that happens below 40 px (Brand Guide, small
   * sizes); the shell headers (H1, H2, H3) keep the full mark at 24 and 26 px.
   */
  variant?: "full" | "small";
}

/**
 * The Bookmark mark: a plum page with a saffron ribbon and two text lines cut out of it.
 * The page takes the theme's primary colour, so it follows light, dark and high contrast.
 */
export const Mark = ({ className, size = 32, title, tone, variant }: MarkProps) => {
  const px = Math.max(16, size);
  const small = variant ? variant === "small" : px < SMALL_MARK_PX;
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
        className="hc:hidden"
        d={small ? PAGE : `${PAGE}${LINES}`}
        fill={tone === "on-dark" ? "#d9a6d2" : "var(--primary)"}
        fillRule={small ? undefined : "evenodd"}
      />
      <path
        className="hidden hc:inline"
        d={small ? `${PAGE}${RIBBON_KEYLINE}` : `${PAGE}${RIBBON_KEYLINE}${LINES}`}
        fill="#fff"
        fillRule="evenodd"
      />
      <path d={RIBBON} fill="var(--accent)" />
    </svg>
  );
};

/**
 * The horizontal lockup: the mark and the outlined wordmark, 8 px apart. The default is the
 * header lockup (H1): a 26 px mark beside a wordmark at 20 px type. It names itself "Steward"
 * once, for screen readers.
 */
export const Lockup = ({
  className,
  fontSize,
  size = 26,
  tone,
}: {
  className?: string;
  /** The wordmark's type size; by default it scales with the mark (20 px beside 26 px). */
  fontSize?: number;
  size?: number;
  tone?: MarkProps["tone"];
}) => {
  const { t } = useTranslation("shell");
  return (
    <span
      aria-label={t("brand.name")}
      className={cn("inline-flex items-center gap-2", tone !== "on-dark" && "text-ink", className)}
      role="img"
    >
      <Mark size={size} tone={tone} variant="full" />
      <Wordmark fontSize={fontSize ?? (size * 20) / 26} />
    </span>
  );
};

/**
 * The loading mark (2.8 s, once): the page fills with plum, the lines type left to right, then
 * the ribbon drops, and the complete mark stays. With reduced motion it's the complete mark plus "Loading…".
 */
export const Loader = ({
  className,
  decorative = false,
  label,
  size = 64,
}: {
  className?: string;
  /**
   * The words beside it already say what's loading (G9's "Signing in…"), so the mark is only
   * drawn: no status role and no text, even with reduced motion.
   */
  decorative?: boolean;
  /** What's loading, for screen readers: "Loading your work…". */
  label?: string;
  size?: number;
}) => {
  const { t } = useTranslation("common");
  const clip = useId();
  const text = label ?? t("status.loading");
  return (
    <div
      aria-hidden={decorative || undefined}
      className={cn("grid justify-items-center gap-3", className)}
      role={decorative ? undefined : "status"}
    >
      <svg
        aria-hidden="true"
        className="motion-reduce:hidden"
        data-testid="book-mark"
        height={size}
        viewBox="0 0 48 48"
        width={size}
      >
        <defs>
          <clipPath id={clip}>
            <path d={PAGE} />
          </clipPath>
        </defs>
        {/* High contrast draws the loading page white, as the Brand Guide's hc mark is. */}
        <path
          className="hc:stroke-white"
          d={PAGE}
          fill="none"
          stroke="var(--primary)"
          strokeOpacity=".35"
          strokeWidth="1.5"
        />
        <g clipPath={`url(#${clip})`}>
          <rect
            className="stw-loader-fill hc:fill-white"
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
      {decorative ? null : <span className="text-sm text-muted motion-safe:sr-only">{text}</span>}
    </div>
  );
};
