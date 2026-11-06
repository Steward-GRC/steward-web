// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { File as NodeFile } from "node:buffer";
import { createRoutesStub, useLoaderData, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Generate from "./drafts.$number.generate";

type Props = Parameters<typeof Generate>[0];

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  readonly listeners = new Map<string, ((event: MessageEvent<string>) => void)[]>();
  constructor(readonly url: string) {
    FakeEventSource.instances.push(this);
  }
  addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  close() {}
  emit(type: string, data = "") {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new MessageEvent(type, { data }));
    }
  }
}

let health = { available: true, reason: null as null | string };

beforeEach(() => {
  FakeEventSource.instances = [];
  health = { available: true, reason: null };
  vi.stubGlobal("EventSource", FakeEventSource);
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json(health))),
  );
});
afterEach(() => vi.unstubAllGlobals());

const outline = [
  { key: "purpose", level: 1, order: 0, required: true, title: "1. Purpose" },
  { key: "signing-in", level: 1, order: 1, required: true, title: "2. Signing in" },
  { key: "records", level: 1, order: 2, required: true, title: "3. Visitor records" },
  { key: "exceptions", level: 2, order: 3, required: false, title: "3.1 Exceptions" },
];

const loaderData = {
  aiHealth: { available: true, reason: null },
  draftId: "v-9",
  outline,
  policy: {
    homeGroupId: "g-1",
    id: "p-1",
    number: "POL-VISITOR-000001",
    title: "Visitor Sign-in Policy",
  },
  sections: outline.map((section) => ({ key: section.key, text: "", title: section.title })),
};

const Page = () => {
  const data = useLoaderData();
  return <Generate {...({ loaderData: data } as unknown as Props)} />;
};

const Editor = () => <pre>{JSON.stringify(useLocation().state)}</pre>;

const open = (data: object = loaderData) => {
  const posted = vi.fn();
  const resources = vi.fn();
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const fields = Object.fromEntries(await request.formData());
        posted(fields);
        if (fields.intent === "summarize") {
          return { intent: fields.intent, ok: true, summary: "Visitors sign in." };
        }
        return { intent: fields.intent, jobId: `job-${posted.mock.calls.length}`, ok: true };
      },
      Component: Page,
      loader: () => data,
      path: "/drafts/:number/generate",
    },
    { Component: Editor, path: "/drafts/:number" },
    {
      action: async ({ request }) => {
        const form = await request.formData();
        const file = form.get("file") as File;
        resources(file.name);
        return file.name === "scan.pdf"
          ? { ok: false, reason: null }
          : { characters: 4812, content: "Notes.", ok: true, title: file.name };
      },
      path: "/resources/documents/extract",
    },
    {
      action: async ({ request }) => {
        const form = await request.formData();
        const url = String(form.get("url"));
        return url.includes(" ")
          ? { malformed: true, ok: false, url }
          : { ok: true, readable: false, url };
      },
      path: "/resources/documents/validate-url",
    },
  ]);
  render(<Stub initialEntries={["/drafts/POL-VISITOR-000001/generate"]} />);
  return posted;
};

const finish = (result: object) =>
  act(() =>
    FakeEventSource.instances.at(-1)!.emit(
      "message",
      JSON.stringify({
        error: null,
        phase: "AI_JOB_PHASE_SUCCEEDED",
        resultJson: JSON.stringify(result),
      }),
    ),
  );

const drafted = {
  sections: [
    { content: "This policy explains how visitors sign in.", sectionKey: "purpose" },
    { content: "Every visitor signs in at reception.", sectionKey: "signing-in" },
    { content: "We keep each visitor's name.", sectionKey: "records" },
  ],
};

/** Steps 1 and 2 with a brief, then the first draft. */
const generateFirstDraft = async () => {
  const posted = open();
  await userEvent.type(
    await screen.findByRole("textbox", { name: "Brief" }),
    "How visitors sign in and what we keep.",
  );
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  await userEvent.click(screen.getByRole("button", { name: "Generate draft" }));
  await screen.findByText("Drafting…");
  finish(drafted);
  await screen.findByRole("article", { name: "1. Purpose" });
  return posted;
};

describe("Generate with AI (U30)", () => {
  it("names the policy and shows the steps, without Framing until the gateway takes one", async () => {
    open();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Generate “Visitor Sign-in Policy” with AI",
      }),
    ).toBeInTheDocument();
    const steps = within(screen.getByRole("list", { name: "Steps" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      "1 Sources & brief",
      "2 Output format",
      "3 Draft & refine",
    ]);
    expect(steps[0]).toHaveAttribute("aria-current", "step");
  });

  it("reads a reference document and checks reference URLs (U30.1)", async () => {
    // A multipart post needs Node's own FormData and File: the router builds a Node Request.
    const sample = await new Response("a=1", {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }).formData();
    const NodeFormData = sample.constructor;
    vi.stubGlobal("FormData", NodeFormData);
    vi.stubGlobal("File", NodeFile);
    open();
    const attach = await screen.findByLabelText("Reference document (optional)");
    await userEvent.upload(attach, new NodeFile(["%PDF"], "visitor-notes.pdf") as unknown as File);
    expect(await screen.findByText("Read 4,812 characters")).toBeInTheDocument();

    await userEvent.upload(attach, new NodeFile(["x"], "scan.pdf") as unknown as File);
    expect(await screen.findByText("Could not read that document.")).toBeInTheDocument();

    const url = screen.getByRole("textbox", { name: "Reference URL (optional)" });
    await userEvent.type(url, "https://policies.example.org/old");
    await userEvent.click(screen.getByRole("button", { name: "Add URL" }));
    expect(await screen.findByText("Not readable")).toBeInTheDocument();
    await userEvent.type(url, "not a url");
    await userEvent.click(screen.getByRole("button", { name: "Add URL" }));
    expect(await screen.findByText("That doesn’t look like a valid URL.")).toBeInTheDocument();
  });

  it("needs a brief before moving on", async () => {
    open();
    await userEvent.click(await screen.findByRole("button", { name: "Next" }));
    expect(screen.getByRole("textbox", { name: "Brief" })).toBeInvalid();
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Sources");
  });

  it("locks required sections and lets optional ones be left out (U30.3)", async () => {
    const posted = open();
    await userEvent.type(await screen.findByRole("textbox", { name: "Brief" }), "Visitors");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    const format = screen.getByRole("region", { name: "Output format" });
    expect(within(format).getAllByText("Required")).toHaveLength(3);
    const exceptions = within(format).getByRole("switch", { name: "3.1 Exceptions" });
    expect(exceptions).toBeChecked();
    await userEvent.click(exceptions);
    await userEvent.click(screen.getByRole("button", { name: "Generate draft" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalled());
    const sent = posted.mock.calls[0]![0] as Record<string, string>;
    expect(sent.intent).toBe("draft");
    expect(sent.brief).toBe("Visitors");
    expect(JSON.parse(sent.sectionsJson!).map((s: { key: string }) => s.key)).toEqual([
      "purpose",
      "signing-in",
      "records",
    ]);
  });

  it("says when there's no template", async () => {
    open({
      ...loaderData,
      outline: [],
      sections: [{ key: "content", text: "", title: "Content" }],
    });
    await userEvent.type(await screen.findByRole("textbox", { name: "Brief" }), "Visitors");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("No template attached")).toBeInTheDocument();
  });

  it("drafts, then shows each section in the preview", async () => {
    await generateFirstDraft();
    const purpose = screen.getByRole("article", { name: "1. Purpose" });
    expect(purpose).toHaveTextContent("This policy explains how visitors sign in.");
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Draft & refine");
  });

  it("refines with a turn: Improve changes the sections it touches", async () => {
    const posted = await generateFirstDraft();
    await userEvent.click(screen.getByRole("radio", { name: "Improve" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Ask for a change…" }),
      "Say records are kept for 12 months.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenLastCalledWith(
        expect.objectContaining({
          instruction: "Say records are kept for 12 months.",
          intent: "revise",
        }),
      ),
    );
    await screen.findByText("Drafting…");
    finish({
      sections: [
        {
          changed: true,
          content: "We keep each visitor's name. Records are deleted after 12 months.",
          sectionKey: "records",
        },
      ],
    });
    const records = await screen.findByRole("article", { name: "3. Visitor records" });
    expect(within(records).getByText("Changed this turn")).toBeInTheDocument();
    expect(within(records).getByRole("insertion")).toHaveTextContent("12 months.");
    expect(screen.getByText("Say records are kept for 12 months.")).toBeInTheDocument();
  });

  it("keeps a locked section, and asks before changing it", async () => {
    await generateFirstDraft();
    const purpose = screen.getByRole("article", { name: "1. Purpose" });
    await userEvent.click(within(purpose).getByRole("button", { name: "Lock 1. Purpose" }));
    expect(within(purpose).getByText("Locked")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: "Improve" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Ask for a change…" }), "Shorter");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("Drafting…");
    finish({
      sections: [{ changed: true, content: "How visitors sign in.", sectionKey: "purpose" }],
    });

    const notice = await screen.findByRole("group", {
      name: "May need updating · 1. Purpose (locked)",
    });
    expect(screen.getByRole("article", { name: "1. Purpose" })).toHaveTextContent(
      "This policy explains how visitors sign in.",
    );
    await userEvent.click(within(notice).getByRole("button", { name: "Unlock & update" }));
    expect(screen.getByRole("article", { name: "1. Purpose" })).toHaveTextContent(
      "How visitors sign in.",
    );
  });

  it("applies the draft to the editor", async () => {
    await generateFirstDraft();
    await userEvent.click(screen.getByRole("button", { name: "Apply draft" }));
    const handed = await screen.findByText(/aiApply/);
    const state = JSON.parse(handed.textContent!) as {
      aiApply: { entries: { after: string; key: string; kind: string }[] };
    };
    expect(
      state.aiApply.entries.filter((entry) => entry.kind === "changed").map((entry) => entry.key),
    ).toEqual(["purpose", "signing-in", "records"]);
  });

  it("is off, and says why, when AI is unavailable", async () => {
    health = { available: false, reason: "disabled_by_admin" };
    open({ ...loaderData, aiHealth: { available: false, reason: "disabled_by_admin" } });
    await userEvent.type(await screen.findByRole("textbox", { name: "Brief" }), "Visitors");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("AI turned off by an administrator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate draft" })).toBeDisabled();
  });
});
