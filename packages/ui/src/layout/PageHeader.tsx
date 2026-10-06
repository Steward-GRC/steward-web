import { type ReactNode } from "react";

import { cn } from "#ui/lib/cn";

export interface PageHeaderProps {
  /** Buttons on the right. */
  actions?: ReactNode;
  className?: string;
  /** The small line above the title. */
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
}

/** The page header every screen opens with: eyebrow, title, muted subtitle and actions. */
export const PageHeader = ({ actions, className, eyebrow, subtitle, title }: PageHeaderProps) => (
  <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
    <div className="grid gap-1">
      {eyebrow ? (
        <p className="text-xs font-medium tracking-[.04em] text-muted">{eyebrow}</p>
      ) : null}
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {subtitle ? <p className="text-base text-muted">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);
