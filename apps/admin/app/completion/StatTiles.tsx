// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { cn } from "@steward-web/ui";

/**
 * Completion's stat cards (A13, A14): a surface with a 1 px border and 10 px corners, the label
 * in 12 px muted over the value in 600 22 px.
 */
export const StatTiles = ({
  className,
  label,
  tiles,
}: {
  className?: string;
  label: string;
  tiles: readonly { label: string; value: string }[];
}) => (
  <ul aria-label={label} className={cn("grid gap-2.5", className)}>
    {tiles.map((tile) => (
      <li
        className="flex flex-col gap-1 rounded-[10px] border border-border bg-surface px-3.5 py-3"
        key={tile.label}
      >
        <span className="text-xs text-muted">{tile.label}</span>
        <b className="text-[22px] leading-tight font-semibold">{tile.value}</b>
      </li>
    ))}
  </ul>
);
