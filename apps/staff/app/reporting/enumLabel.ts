// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

/** The `reporting` namespace's groups that label one gateway enum each. */
export type EnumLabelGroup =
  | "breachDecision"
  | "informationKind"
  | "kind"
  | "noticeRecipient"
  | "noticeStatus"
  | "outcome"
  | "reportAnswer"
  | "riskMitigation"
  | "riskRecipient"
  | "riskSuggestion"
  | "riskViewed"
  | "status";

/**
 * The i18n key, under the `reporting` namespace, for one gateway enum value. The gateway sends
 * SCREAMING_SNAKE_CASE (`ANOTHER_ORGANISATION`) and the catalog keys are camelCase
 * (`anotherOrganisation`), so lower-casing the value alone misses every multi-word one.
 */
export const enumLabelKey = (group: EnumLabelGroup, value: string): string => {
  const [first = "", ...rest] = value.toLowerCase().split("_");
  return `${group}.${first}${rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("")}`;
};
