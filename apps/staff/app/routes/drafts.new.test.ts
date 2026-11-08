// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Creating a policy ends in a redirect to its draft. The page used to navigate itself once the
// create answered, while the router was still refreshing the page's data; on a slow connection the
// two overlapped and the draft's route never loaded (the address changed, the form stayed).
import { afterEach, describe, expect, it, vi } from "vitest";

const createPolicy = vi.hoisted(() => vi.fn());

vi.mock("../authoring/authoring.server", () => ({
  createPolicy,
  listAuthorableGroups: vi.fn(),
  listAuthorableTemplates: vi.fn(),
}));
vi.mock("@steward-web/auth/server", () => ({
  requirePermissionFromRequest: vi.fn(async () => null),
  requireRoleFromRequest: vi.fn(async () => null),
}));

const { action } = await import("./drafts.new");

type ActionArguments = Parameters<typeof action>[0];

const submit = (fields: Record<string, string>) => {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.set(name, value);
  return action({
    request: new Request("https://staff.steward.example/drafts/new/policy", {
      body,
      method: "POST",
    }),
  } as unknown as ActionArguments);
};

afterEach(() => vi.clearAllMocks());

describe("drafts.new action", () => {
  it("sends the author to the new draft by redirect", async () => {
    createPolicy.mockResolvedValue({ id: "policy-12", number: "POL-FINANCE-000012" });
    const answer = await submit({ categoryId: "category-finance", title: "Hello" });
    expect(answer).toBeInstanceOf(Response);
    const response = answer as Response;
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(response.headers.get("location")).toBe("/drafts/POL-FINANCE-000012");
  });

  it("asks for a title and a category instead of creating", async () => {
    const answer = (await submit({ categoryId: "", title: "" })) as { data: { ok: boolean } };
    expect(createPolicy).not.toHaveBeenCalled();
    expect(answer.data.ok).toBe(false);
  });

  it("answers a refusal as data, so the form can say why", async () => {
    createPolicy.mockRejectedValue(new Error("refused"));
    const answer = (await submit({ categoryId: "category-finance", title: "Hello" })) as {
      data: { ok: boolean };
    };
    expect(answer.data.ok).toBe(false);
  });
});
