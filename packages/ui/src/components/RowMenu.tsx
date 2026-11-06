// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { ContextMenu } from "radix-ui";
import { type ReactElement, type ReactNode } from "react";
import { Link, useHref, useInRouterContext } from "react-router";

/** An entry of a row's right-click menu: a link, an action, or both. */
export interface RowAction {
  /** Opens this address (inside the app). */
  href?: string;
  label: ReactNode;
  onSelect?: () => void;
}

const itemClass =
  "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-base text-ink outline-none select-none data-[highlighted]:bg-primary-soft data-[highlighted]:text-on-primary-soft hover:text-ink";

/** The row's own address, with the app's base path, as a full address that can be shared. */
const fullAddress = (resolved: string) => new URL(resolved, globalThis.location.origin).toString();

const RoutedItems = ({ href }: { href: string }) => {
  const { t } = useTranslation("common");
  const resolved = useHref(href);
  return (
    <>
      <ContextMenu.Item asChild>
        <Link className={itemClass} to={href}>
          {t("table.rowMenu.open")}
        </Link>
      </ContextMenu.Item>
      <ContextMenu.Item asChild>
        <a className={itemClass} href={resolved} rel="noreferrer" target="_blank">
          {t("table.rowMenu.openNewTab")}
        </a>
      </ContextMenu.Item>
      <ContextMenu.Item
        className={itemClass}
        onSelect={() => void navigator.clipboard?.writeText(fullAddress(resolved))}
      >
        {t("table.rowMenu.copyLink")}
      </ContextMenu.Item>
    </>
  );
};

const PlainItems = ({ href }: { href: string }) => {
  const { t } = useTranslation("common");
  return (
    <>
      <ContextMenu.Item asChild>
        <a className={itemClass} href={href}>
          {t("table.rowMenu.open")}
        </a>
      </ContextMenu.Item>
      <ContextMenu.Item asChild>
        <a className={itemClass} href={href} rel="noreferrer" target="_blank">
          {t("table.rowMenu.openNewTab")}
        </a>
      </ContextMenu.Item>
      <ContextMenu.Item
        className={itemClass}
        onSelect={() => void navigator.clipboard?.writeText(fullAddress(href))}
      >
        {t("table.rowMenu.copyLink")}
      </ContextMenu.Item>
    </>
  );
};

/**
 * The right-click menu on a table row (#90). A row with an address gets Open, Open in new tab
 * and Copy link; the table's own actions (`actions`) follow. A row with neither keeps the
 * browser's menu. The context-menu key and Shift+F10 open it from the keyboard too.
 */
export const RowMenu = ({
  actions = [],
  children,
  href,
}: {
  actions?: readonly RowAction[];
  children: ReactElement;
  href?: string;
}) => {
  const inRouter = useInRouterContext();
  if (!href && actions.length === 0) return children;
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="z-[var(--z-popover)] min-w-48 rounded-md border border-border bg-surface p-1 shadow-[var(--shadow-3)]">
          {href ? inRouter ? <RoutedItems href={href} /> : <PlainItems href={href} /> : null}
          {actions.map((action, index) => (
            <ContextMenu.Item
              className={itemClass}
              key={index}
              onSelect={() => action.onSelect?.()}
            >
              {action.label}
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
