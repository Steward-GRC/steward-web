// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLoaderData, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Revise from "./drafts.$number.revise";

type Props = Parameters<typeof Revise>[0];

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

beforeEach(() => {
  FakeEventSource.instances = [];
  vi.stubGlobal("EventSource", FakeEventSource);
  // The shared AI-health poll: AI stays as the page's loader said.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json({ available: true, reason: null }))),
  );
});
afterEach(() => vi.unstubAllGlobals());

const sections = [
  {
    key: "report",
    text: "Tell the service desk within one hour.",
    title: "1. Report it straight away",
  },
  { key: "lock", text: "Lock it remotely.", title: "2. Lock it" },
  { key: "wipe", text: "Wipe it after a day.", title: "3. Wipe it" },
];

const loaderData = {
  aiHealth: { available: true, reason: null },
  draftId: "v-9",
  policy: { id: "p-1", number: "PRC-LOST-000001", title: "Lost Device Procedure" },
  sections,
};

const Page = () => {
  const data = useLoaderData();
  return <Revise {...({ loaderData: data } as unknown as Props)} />;
};

const Editor = () => {
  const location = useLocation();
  return <pre>{JSON.stringify(location.state)}</pre>;
};

const open = (data: object = loaderData) => {
  const posted = vi.fn();
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return { jobId: "job-1", ok: true };
      },
      Component: Page,
      loader: () => data,
      path: "/drafts/:number/revise",
    },
    { Component: Editor, path: "/drafts/:number" },
  ]);
  render(<Stub initialEntries={["/drafts/PRC-LOST-000001/revise"]} />);
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

const askFor = async (instruction: string) => {
  await userEvent.type(
    await screen.findByRole("textbox", { name: "What should change?" }),
    instruction,
  );
  await userEvent.click(screen.getByRole("button", { name: "Generate change set" }));
};

describe("Revise with AI (U31)", () => {
  it("asks what should change and sends it with every section", async () => {
    const posted = open();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Improve “Lost Device Procedure”" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "What should change?" })).toHaveAttribute(
      "placeholder",
      'e.g. "clean up the wording" or "add a rollback section"',
    );
    await askFor("add a rollback section");
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        customFraming: "",
        framing: "",
        instruction: "add a rollback section",
        intent: "revise",
        sectionsJson: JSON.stringify(sections),
        versionId: "v-9",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Generating");
  });

  it("sends the framing picked for the revision", async () => {
    const posted = open();
    await userEvent.click(await screen.findByRole("radio", { name: /Plain language/ }));
    await askFor("simplify it");
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith(
        expect.objectContaining({ customFraming: "", framing: "PLAIN" }),
      ),
    );
  });

  it("sends Your own wording, and holds the request until it is valid", async () => {
    const posted = open();
    await userEvent.click(await screen.findByRole("radio", { name: /Your own wording/ }));
    await userEvent.type(
      await screen.findByRole("textbox", { name: "What should change?" }),
      "simplify it",
    );
    await userEvent.click(screen.getByRole("button", { name: "Generate change set" }));
    const wording = screen.getByRole("textbox", { name: "Your wording" });
    expect(wording).toBeInvalid();
    expect(screen.getByText("Describe how the draft should read.")).toBeInTheDocument();
    expect(posted).not.toHaveBeenCalled();

    await userEvent.type(wording, "Warm, direct");
    await userEvent.click(screen.getByRole("button", { name: "Generate change set" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith(
        expect.objectContaining({ customFraming: "Warm, direct", framing: "CUSTOM" }),
      ),
    );
  });

  it("refuses wording over 500 characters", async () => {
    const posted = open();
    await userEvent.click(await screen.findByRole("radio", { name: /Your own wording/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your wording" }), {
      target: { value: "a".repeat(501) },
    });
    await askFor("simplify it");
    expect(screen.getByText("Keep it to 500 characters or fewer.")).toBeInTheDocument();
    expect(posted).not.toHaveBeenCalled();
  });

  it("reviews the change set: counts, a card per change, unchanged folded away", async () => {
    open();
    await askFor("add a rollback section");
    await screen.findByRole("status");
    finish({
      newSections: [
        { afterKey: "wipe", content: "Return to the previous device.", title: "4. Rolling back" },
      ],
      sections: [
        {
          changed: true,
          content: "Tell the service desk within one hour, then follow section 4 if needed.",
          sectionKey: "report",
        },
        { changed: false, sectionKey: "lock" },
        { changed: false, sectionKey: "wipe" },
      ],
    });

    expect(
      await screen.findByText("1 changed · 1 new · 0 removed · 2 unchanged"),
    ).toBeInTheDocument();
    const changed = screen.getByRole("article", { name: "1. Report it straight away" });
    expect(within(changed).getByText("Changed")).toBeInTheDocument();
    expect(within(changed).getByRole("insertion")).toHaveTextContent(
      "hour, then follow section 4 if needed.",
    );
    await userEvent.click(within(changed).getByRole("radio", { name: "Final" }));
    expect(within(changed).queryByRole("insertion")).toBeNull();
    const added = screen.getByRole("article", { name: "4. Rolling back" });
    expect(within(added).getByText("New")).toBeInTheDocument();

    const folded = screen.getByRole("button", { name: "2 unchanged sections" });
    expect(screen.queryByRole("article", { name: "2. Lock it" })).toBeNull();
    await userEvent.click(folded);
    expect(screen.getByRole("article", { name: "2. Lock it" })).toBeInTheDocument();
  });

  it("applies the change set to the draft in the editor", async () => {
    open();
    await askFor("add a rollback section");
    await screen.findByRole("status");
    finish({
      sections: [{ changed: true, content: "Call the desk.", sectionKey: "report" }],
    });
    await userEvent.click(await screen.findByRole("button", { name: "Apply as draft revision" }));
    const handed = await screen.findByText(/aiApply/);
    const state = JSON.parse(handed.textContent!) as {
      aiApply: { entries: { after: string; key: string; kind: string }[] };
    };
    expect(state.aiApply.entries.filter((entry) => entry.kind !== "unchanged")).toEqual([
      expect.objectContaining({ after: "Call the desk.", key: "report", kind: "changed" }),
    ]);
  });

  it("says when there's nothing to change, and starts over", async () => {
    open();
    await askFor("tidy up");
    await screen.findByRole("status");
    finish({ sections: [] });
    expect(await screen.findByText("Nothing to change")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apply as draft revision" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(screen.getByRole("textbox", { name: "What should change?" })).toHaveValue("");
  });

  it("is off, and says why, when AI is unavailable", async () => {
    open({ ...loaderData, aiHealth: { available: false, reason: "disabled_by_admin" } });
    expect(await screen.findByText("AI turned off by an administrator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate change set" })).toBeDisabled();
  });
});
