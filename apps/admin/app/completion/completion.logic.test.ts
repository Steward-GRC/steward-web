// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Group, Policy } from "@steward-web/api-client";

import {
  AckTrigger,
  DocumentType,
  PolicyStatus,
  ReviewCadence,
  Sensitivity,
} from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { effectiveAckTrigger, obligatingPolicies, requiresAck } from "./completion.logic";

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  ackEveryone: false,
  ackEveryoneSet: false,
  ackTriggers: AckTrigger.None,
  defaultTemplateNone: false,
  id: "group-1",
  name: "IT Security",
  owners: [],
  reviewCadence: ReviewCadence.None,
  slug: "it-security",
  ...overrides,
});

const makePolicy = (overrides: Partial<Policy> = {}): Policy => ({
  category: "IT Security",
  documentType: DocumentType.Policy,
  homeGroupId: "group-1",
  id: "pol-1",
  number: "POL-001",
  ownerUserId: "u-1",
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "",
  templateNone: true,
  title: "Code of Conduct",
  updated: null,
  version: "1.0.0",
  viewerCan: {
    ack: false,
    approve: false,
    canBreakGlass: false,
    contentObfuscated: false,
    edit: false,
    read: true,
    submit: false,
  },
  ...overrides,
});

describe("effectiveAckTrigger", () => {
  it("uses the policy's own trigger when set", () => {
    const policy = makePolicy({ ackTriggers: AckTrigger.OnChange });
    const group = makeGroup({ ackTriggers: AckTrigger.OnPublish });
    expect(effectiveAckTrigger(policy, group)).toBe(AckTrigger.OnChange);
  });

  it("falls back to the owning group's trigger when the policy has none", () => {
    const policy = makePolicy({ ackTriggers: null });
    const group = makeGroup({ ackTriggers: AckTrigger.OnPublish });
    expect(effectiveAckTrigger(policy, group)).toBe(AckTrigger.OnPublish);
  });

  it("is NONE when neither the policy nor a found group sets one", () => {
    const policy = makePolicy({ ackTriggers: null });
    expect(effectiveAckTrigger(policy)).toBe(AckTrigger.None);
  });
});

describe("requiresAck", () => {
  it("is true only for a published policy with a non-NONE effective trigger", () => {
    const group = makeGroup({ ackTriggers: AckTrigger.OnPublish });
    const published = makePolicy({ currentPublishedVersionId: "pv-1" });
    expect(requiresAck(published, group)).toBe(true);
  });

  it("is false without a published version, even with a trigger set", () => {
    const group = makeGroup({ ackTriggers: AckTrigger.OnPublish });
    const draftOnly = makePolicy({ currentPublishedVersionId: null });
    expect(requiresAck(draftOnly, group)).toBe(false);
  });

  it("is false when the effective trigger is NONE", () => {
    const group = makeGroup({ ackTriggers: AckTrigger.None });
    const published = makePolicy({ ackTriggers: null, currentPublishedVersionId: "pv-1" });
    expect(requiresAck(published, group)).toBe(false);
  });
});

describe("obligatingPolicies", () => {
  it("pairs each obligating policy with its owning group and drops the rest", () => {
    const groups = [makeGroup({ ackTriggers: AckTrigger.OnPublish, id: "group-1" })];
    const policies = [
      makePolicy({ currentPublishedVersionId: "pv-1", homeGroupId: "group-1", number: "POL-001" }),
      makePolicy({ currentPublishedVersionId: null, homeGroupId: "group-1", number: "POL-002" }),
    ];
    const result = obligatingPolicies(policies, groups);
    expect(result).toHaveLength(1);
    expect(result[0]?.policy.number).toBe("POL-001");
    expect(result[0]?.group?.id).toBe("group-1");
  });
});
