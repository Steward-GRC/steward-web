// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Group, Policy } from "@steward-web/api-client";

import { AckTrigger } from "@steward-web/api-client";

/** A policy's own ack triggers, falling back to its owning group's when it has none set. */
export const effectiveAckTrigger = (policy: Policy, group?: Group): AckTrigger =>
  policy.ackTriggers ?? group?.ackTriggers ?? AckTrigger.None;

/**
 * A policy requires acknowledgement iff it has a published version AND its effective ack
 * trigger is not NONE. Mirrors the gateway's own completionReport/ackRoster precondition: a
 * policy with no published version has no audience to report on.
 */
export const requiresAck = (policy: Policy, group?: Group): boolean =>
  policy.currentPublishedVersionId != null &&
  effectiveAckTrigger(policy, group) !== AckTrigger.None;

/** Every policy that requires acknowledgement, each paired with its owning group (if found). */
export const obligatingPolicies = (
  policies: readonly Policy[],
  groups: readonly Group[],
): { group?: Group; policy: Policy }[] => {
  const groupById = new Map(groups.map((g) => [g.id, g]));
  return policies
    .map((policy) => ({ group: groupById.get(policy.homeGroupId), policy }))
    .filter(({ group, policy }) => requiresAck(policy, group));
};
