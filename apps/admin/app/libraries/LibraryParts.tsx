// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Button, PageHeader, Tabs, TabsList, TabsTrigger, Tooltip } from "@steward-web/ui";
import { Plus } from "lucide-react";
import { type ReactNode, useId } from "react";

import type { LibraryTab } from "./libraries.logic";

/**
 * A library's header (A25–A27): its title and line, and "+ New …" for someone who may add one.
 * The page sits in the panel's Structure group, so it carries no eyebrow of its own.
 */
export const LibraryHeader = ({
  newLabel,
  onNew,
  subtitle,
  title,
}: {
  newLabel: string;
  /** Left out when the viewer can't add an entry. */
  onNew?: () => void;
  subtitle: string;
  title: string;
}) => (
  <PageHeader
    actions={
      onNew ? (
        <Button className="h-[38px] px-3" onClick={onNew}>
          <Plus aria-hidden="true" />
          {newLabel}
        </Button>
      ) : undefined
    }
    subtitle={subtitle}
    title={title}
  />
);

/** The libraries' Active / Archived tabs; the list below them is the caller's. */
export const LibraryTabs = ({
  children,
  onTab,
  tab,
}: {
  children: ReactNode;
  onTab: (tab: LibraryTab) => void;
  tab: LibraryTab;
}) => {
  const { t } = useTranslation("admin");
  return (
    <Tabs onValueChange={(value) => onTab(value as LibraryTab)} value={tab}>
      <TabsList aria-label={t("libraries.tabs.label")}>
        <TabsTrigger value="active">{t("libraries.tabs.active")}</TabsTrigger>
        <TabsTrigger value="archived">{t("libraries.tabs.archived")}</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

/** "3 policies": how many policies attach the entry. */
export const UsedBy = ({ count }: { count: number }) => {
  const { t } = useTranslation("admin");
  return <>{t("libraries.usedBy", { count })}</>;
};

/**
 * Delete, disabled while anything attaches the entry, saying why: "In use — archive instead of
 * deleting." The reason is the button's description and shows on hover or focus.
 */
export const DeleteButton = ({ inUse, onDelete }: { inUse: boolean; onDelete: () => void }) => {
  const { t } = useTranslation("admin");
  const reasonId = useId();
  const button = (
    <Button
      aria-describedby={inUse ? reasonId : undefined}
      aria-disabled={inUse || undefined}
      className="h-8 px-2.5"
      onClick={inUse ? undefined : onDelete}
      variant="ghost"
    >
      {t("libraries.actions.delete")}
    </Button>
  );
  if (!inUse) return button;
  return (
    <>
      <Tooltip content={t("libraries.inUse")}>{button}</Tooltip>
      <span className="sr-only" id={reasonId}>
        {t("libraries.inUse")}
      </span>
    </>
  );
};
