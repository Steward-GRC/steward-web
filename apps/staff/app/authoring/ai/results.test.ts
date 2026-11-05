// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { changeSetOf, parseDraftResult, parseReviewResult, parseRevisionResult } from "./results";

describe("parseDraftResult", () => {
  it("reads each drafted section's content, as steward-ai writes it", () => {
    const json = JSON.stringify({
      sections: [
        { content: "Why this exists.", sectionKey: "purpose" },
        { content: "Who it covers.", sectionKey: "scope" },
      ],
    });
    expect(parseDraftResult(json)).toEqual([
      { sectionKey: "purpose", text: "Why this exists." },
      { sectionKey: "scope", text: "Who it covers." },
    ]);
  });

  it("answers no sections for anything else", () => {
    expect(parseDraftResult("not json")).toEqual([]);
    expect(parseDraftResult(JSON.stringify({ sections: "nope" }))).toEqual([]);
  });
});

describe("parseReviewResult", () => {
  it("reads the findings with their severity, section and suggestion", () => {
    const json = JSON.stringify({
      findings: [
        { finding: "Section 3 is empty", sectionKey: "records", severity: "blocker" },
        { finding: "No retention period", severity: "warn", suggestion: "Say 12 months." },
        { finding: "Host isn't linked", sectionKey: "signing-in", severity: "info" },
      ],
    });
    expect(parseReviewResult(json)).toEqual([
      { finding: "Section 3 is empty", sectionKey: "records", severity: "blocker" },
      { finding: "No retention period", severity: "warn", suggestion: "Say 12 months." },
      { finding: "Host isn't linked", sectionKey: "signing-in", severity: "info" },
    ]);
  });

  it("drops a finding with an unknown severity or no text", () => {
    const json = JSON.stringify({
      findings: [
        { finding: "Odd", severity: "critical" },
        { finding: "", severity: "warn" },
      ],
    });
    expect(parseReviewResult(json)).toEqual([]);
  });
});

describe("parseRevisionResult and changeSetOf", () => {
  const current = [
    { key: "report", text: "Tell the service desk within one hour.", title: "1. Report it" },
    { key: "lock", text: "Lock the device remotely.", title: "2. Lock it" },
    { key: "old", text: "Fax the form.", title: "3. Old step" },
    { key: "wipe", text: "Wipe it after a day.", title: "4. Wipe it" },
  ];
  const revision = parseRevisionResult(
    JSON.stringify({
      newSections: [
        { afterKey: "wipe", content: "Return to the previous device.", title: "5. Rolling back" },
      ],
      sections: [
        {
          changed: true,
          content: "Tell the service desk within one hour, then follow section 5 if needed.",
          sectionKey: "report",
        },
        { changed: false, sectionKey: "lock" },
        { removed: true, sectionKey: "old" },
        { changed: false, sectionKey: "wipe" },
      ],
    }),
  );

  it("lists each change in the policy's order, with new sections after their anchor", () => {
    const changes = changeSetOf(current, revision);
    expect(changes.entries.map((entry) => [entry.kind, entry.title])).toEqual([
      ["changed", "1. Report it"],
      ["unchanged", "2. Lock it"],
      ["removed", "3. Old step"],
      ["unchanged", "4. Wipe it"],
      ["new", "5. Rolling back"],
    ]);
    expect(changes.counts).toEqual({ changed: 1, new: 1, removed: 1, unchanged: 2 });
  });

  it("keeps the text before and after for the diff", () => {
    const [changed] = changeSetOf(current, revision).entries;
    expect(changed).toMatchObject({
      after: "Tell the service desk within one hour, then follow section 5 if needed.",
      before: "Tell the service desk within one hour.",
      key: "report",
    });
  });

  it("puts a new section with no anchor at the end, and reads a section the model left out as unchanged", () => {
    const changes = changeSetOf(
      current.slice(0, 1),
      parseRevisionResult(
        JSON.stringify({ newSections: [{ content: "Extra.", title: "Annex" }], sections: [] }),
      ),
    );
    expect(changes.entries.map((entry) => entry.kind)).toEqual(["unchanged", "new"]);
  });

  it("is nothing to change when every section is unchanged", () => {
    const changes = changeSetOf(
      current,
      parseRevisionResult(JSON.stringify({ sections: [{ changed: false, sectionKey: "report" }] })),
    );
    expect(changes.counts).toEqual({ changed: 0, new: 0, removed: 0, unchanged: 4 });
    expect(changes.nothing).toBe(true);
  });
});
