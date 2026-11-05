// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// What the full-page AI screens (U30 Generate, U31 Revise) read: the policy, whether AI is
// usable, the template's outline and the draft's sections as text. The editor hands the live
// sections over when it opens one of these pages; these are the stored ones, for a page opened
// on its own.
import { getAiHealth } from "../ai.server";
import { getDraftVersion, getLatestTemplateVersion, getPolicy } from "../authoring.server";
import { aiSections, draftDocument } from "../sections";

export const loadDraftForAi = async (request: Request, policyId: string) => {
  const [policy, aiHealth] = await Promise.all([
    getPolicy(request, policyId),
    getAiHealth(request).catch(() => ({ available: false, reason: "ai_service_unavailable" })),
  ]);
  if (!policy?.viewerCan.edit) throw new Response("Not Found", { status: 404 });
  const [draft, templateVersion] = await Promise.all([
    getDraftVersion(request, policy.id),
    policy.templateId ? getLatestTemplateVersion(request, policy.templateId) : null,
  ]);
  if (!draft) throw new Response("Not Found", { status: 404 });
  const outline = templateVersion?.sections ?? [];
  return {
    aiHealth: { available: aiHealth.available, reason: aiHealth.reason ?? null },
    draftId: draft.id,
    outline,
    policy: { homeGroupId: policy.homeGroupId, id: policy.id, title: policy.title },
    sections: aiSections(draftDocument(draft.contentJson, outline), outline),
  };
};
