// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  matchCategories,
  matchDocuments,
  rankByPrefix,
  searchSubjects,
  SUBJECT_SEARCH_LIMIT,
} from "./subjectSearch.server";

const me = {
  email: "admin@example.org",
  id: "u-admin",
  managedGroupIds: [],
  name: "Admin",
  permissions: [],
  roles: ["site-admin"],
  username: "admin",
};

const jsonOnce = (data: unknown) => Response.json({ data });
const request = () => new Request("https://admin.steward.example/resources/subject-search");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("rankByPrefix", () => {
  it("puts names that start with the words typed before names that contain them", () => {
    const items = [{ label: "Dana Smith" }, { label: "Smithson" }, { label: "Smith" }];
    expect(rankByPrefix(items, "smi").map((item) => item.label)).toEqual([
      "Smith",
      "Smithson",
      "Dana Smith",
    ]);
  });
});

describe("matchCategories (#106)", () => {
  const rows = [
    { id: "c-1", path: "Finance" },
    { id: "c-2", path: "Finance › Expenses" },
    { id: "c-3", path: "Workplace › Travel" },
  ];

  it("matches anywhere in the full path, best first, as picker options", () => {
    expect(matchCategories(rows, "exp")).toEqual([
      { detail: "Finance", id: "c-2", label: "Finance › Expenses" },
    ]);
    expect(matchCategories(rows, "fin").map((option) => option.id)).toEqual(["c-1", "c-2"]);
  });
});

describe("matchDocuments (#106)", () => {
  const documents = [
    { documentType: "POLICY", id: "p-1", number: "POL-EXP-000001", title: "Expense claims" },
    { documentType: "PROCEDURE", id: "r-1", number: "PRC-EXP-000001", title: "Claim steps" },
  ];

  it("matches the number or the title and names the subject the log uses", () => {
    expect(matchDocuments(documents, "claim")).toEqual([
      { detail: "PRC-EXP-000001", id: "procedure:r-1", label: "Claim steps" },
      { detail: "POL-EXP-000001", id: "policy:p-1", label: "Expense claims" },
    ]);
    expect(matchDocuments(documents, "prc-exp").map((option) => option.id)).toEqual([
      "procedure:r-1",
    ]);
  });
});

describe("searchSubjects (#88)", () => {
  it("asks the service for nothing under two characters", async () => {
    const fetchSpy = vi.fn(async () => jsonOnce({ me }));
    vi.stubGlobal("fetch", fetchSpy);
    expect(await searchSubjects(request(), "user", " s ")).toEqual([]);
    expect(await searchSubjects(request(), "group", "")).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("finds people server-side with a cap, keeping the user id as the option's id", async () => {
    const people = Array.from({ length: 14 }, (_, index) => ({
      email: `p${index}@example.org`,
      id: `u-${index}`,
      name: `Person ${index}`,
    }));
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me }))
      .mockResolvedValueOnce(jsonOnce({ searchUsers: people }));
    vi.stubGlobal("fetch", fetchSpy);
    const found = await searchSubjects(request(), "user", "pe");
    expect(found).toHaveLength(SUBJECT_SEARCH_LIMIT);
    expect(found[0]).toEqual({ detail: "p0@example.org", id: "u-0", label: "Person 0" });
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as {
      variables: { limit: number; query: string };
    };
    expect(body.variables).toEqual({ limit: SUBJECT_SEARCH_LIMIT, query: "pe" });
  });

  it("redirects a signed-out caller", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: null })));
    const thrown: unknown = await searchSubjects(request(), "user", "pe").catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
  });
});
