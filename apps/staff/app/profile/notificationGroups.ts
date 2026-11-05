// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// U35's groups: the gateway's notification categories in the frame's order, each with its
// cadence, whether it's required, the types it holds and which of them are overridden. Pure,
// so the grouping is tested without the page.

export type Cadence = "DAILY" | "IMMEDIATE" | "OFF" | "WEEKLY";

/** The categories in the frame's order: required ones first. */
export const CATEGORIES = [
  "COMPLIANCE",
  "SECURITY",
  "TRANSACTIONAL",
  "WORKFLOW",
  "INFORMATIONAL",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** The gateway's compliance floor: these can't be turned off. */
const MANDATORY: ReadonlySet<string> = new Set(["COMPLIANCE", "SECURITY", "TRANSACTIONAL"]);

const CADENCES: readonly Cadence[] = ["IMMEDIATE", "DAILY", "WEEKLY", "OFF"];

export interface NotificationGroup {
  cadence: Cadence;
  category: Category;
  /** Some of its types are set on their own ("· Custom"). */
  custom: boolean;
  mandatory: boolean;
  types: NotificationType[];
}

export interface NotificationType {
  cadence: Cadence;
  delivery: string;
  kind: string;
  mandatory: boolean;
  /** Set on its own, apart from its group's cadence. */
  overridden: boolean;
}

interface Preferences {
  catalog: readonly TypeDef[];
  settings: {
    categories: readonly { cadence: string; category: string; mandatory: boolean }[];
    overrides: readonly ({ cadence: string } & TypeDef)[];
  };
}

interface TypeDef {
  category: string;
  delivery: string;
  kind: string;
  mandatory: boolean;
}

const asCadence = (value: string | undefined): Cadence =>
  CADENCES.includes(value as Cadence) ? (value as Cadence) : "IMMEDIATE";

/** Each category's cadence, types and overrides, in the frame's order. */
export const notificationGroups = (preferences: Preferences): NotificationGroup[] =>
  CATEGORIES.map((category) => {
    const stored = preferences.settings.categories.find((c) => c.category === category);
    const cadence = asCadence(stored?.cadence);
    const types = preferences.catalog
      .filter((type) => type.category === category)
      .map((type): NotificationType => {
        const override = preferences.settings.overrides.find((o) => o.kind === type.kind);
        return {
          cadence: override ? asCadence(override.cadence) : cadence,
          delivery: type.delivery,
          kind: type.kind,
          mandatory: type.mandatory,
          overridden: Boolean(override),
        };
      });
    return {
      cadence,
      category,
      custom: types.some((type) => type.overridden),
      mandatory: stored?.mandatory ?? MANDATORY.has(category),
      types,
    };
  });

/**
 * The cadences a group or type may take: never Off when it's required, and no digest for a
 * notice that's only ever sent at once (the gateway's `IMMEDIATE_ONLY`).
 */
export const cadenceOptions = ({
  delivery,
  mandatory,
}: {
  delivery?: string;
  mandatory: boolean;
}): { disabled: boolean; value: Cadence }[] =>
  CADENCES.map((value) => ({
    disabled:
      (value === "OFF" && mandatory) ||
      ((value === "DAILY" || value === "WEEKLY") && delivery === "IMMEDIATE_ONLY"),
    value,
  }));
