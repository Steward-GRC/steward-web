// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useActionData, useLoaderData } from "react-router";
import { describe, expect, it, vi } from "vitest";

import Ask from "./ask";

type Props = Parameters<typeof Ask>[0];

const answered = {
  answer: {
    answer: "File your claim within 30 days. Book through the travel procedure first.",
    citations: [
      {
        label: "POL-EXPENSES-000002 Expense Claims Policy · §2",
        policyId: "p-exp",
        sectionKey: "2",
        to: "/policies/POL-EXPENSES-000002#2",
      },
      {
        label: "PRC-TRAVEL-000003 Travel Booking Procedure · §1",
        policyId: "p-travel",
        sectionKey: "1",
        to: "/procedures/PRC-TRAVEL-000003#1",
      },
    ],
    hasSensitiveSource: true,
    noAuthorizedSource: false,
    segments: [
      { end: 31, sources: [{ policyId: "p-exp", sectionKey: "2" }], start: 0 },
      { end: 72, sources: [{ policyId: "p-travel", sectionKey: "1" }], start: 32 },
    ],
  },
};

const Page = () => {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  return <Ask {...({ actionData, loaderData } as unknown as Props)} />;
};

const renderAsk = (
  loaderData: object,
  action: (question: string) => Promise<unknown> | unknown = () => answered,
) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        return action(String(form.get("question")));
      },
      Component: Page,
      loader: () => loaderData,
      path: "/ask",
    },
  ]);
  render(<Stub initialEntries={["/ask"]} />);
};

const available = {
  available: true,
  suggestions: ["What must I do before travelling for work?", "I lost my laptop. What now?"],
};

describe("Ask policies & procedures (U6)", () => {
  it("says it's temporarily unavailable while AI is off", async () => {
    renderAsk({ available: false, suggestions: [] });
    expect(
      await screen.findByRole("heading", { level: 1, name: "Ask policies & procedures" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ask policies & procedures is temporarily unavailable. Everything else in the app keeps working as usual.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("asks with the box, the hint and Try asking", async () => {
    renderAsk(available);
    expect(await screen.findByRole("textbox", { name: "Your question" })).toBeInTheDocument();
    expect(screen.getByText("Enter to send, Shift+Enter for a new line.")).toBeInTheDocument();
    const tries = screen.getByRole("group", { name: "Try asking" });
    expect(within(tries).getAllByRole("button")).toHaveLength(2);
  });

  it("answers with numbered citations that link to the sections, and the check-the-source note", async () => {
    const action = vi.fn(() => answered);
    renderAsk(available, action);
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Your question" }),
      "How long do I have to file an expense claim?{Enter}",
    );
    const answer = await screen.findByRole("region", { name: "Answer" });
    expect(action).toHaveBeenCalledWith("How long do I have to file an expense claim?");
    expect(within(answer).getByText("Includes sensitive sources")).toBeInTheDocument();
    expect(within(answer).getByRole("link", { name: "[1]" })).toHaveAttribute("href", "#cite-1");
    expect(
      within(answer).getByRole("link", { name: "POL-EXPENSES-000002 Expense Claims Policy · §2" }),
    ).toHaveAttribute("href", "/policies/POL-EXPENSES-000002#2");
    expect(within(answer).getByText(/Always confirm the requirement/)).toBeInTheDocument();
  });

  it("sends a Try asking question", async () => {
    const action = vi.fn(() => answered);
    renderAsk(available, action);
    await userEvent.click(
      await screen.findByRole("button", { name: "I lost my laptop. What now?" }),
    );
    await screen.findByRole("region", { name: "Answer" });
    expect(action).toHaveBeenCalledWith("I lost my laptop. What now?");
  });

  it("says Reading the policies you can access… while it answers", async () => {
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    renderAsk(available, () => gate.then(() => answered));
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Your question" }),
      "Hi{Enter}",
    );
    expect(await screen.findByText("Reading the policies you can access…")).toBeInTheDocument();
    release?.();
    expect(await screen.findByRole("region", { name: "Answer" })).toBeInTheDocument();
  });

  it("says when no policy answers it, with the way to the library", async () => {
    renderAsk(available, () => ({
      answer: {
        ...answered.answer,
        answer: "",
        citations: [],
        noAuthorizedSource: true,
        segments: [],
      },
    }));
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Your question" }),
      "Hi{Enter}",
    );
    expect(await screen.findByText("No policy answers that")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the library" })).toHaveAttribute(
      "href",
      "/policies",
    );
  });

  it("says it's unavailable when the answer fails", async () => {
    renderAsk(available, () => ({ failure: { status: 503 } }));
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Your question" }),
      "Hi{Enter}",
    );
    expect(await screen.findByText(/is temporarily unavailable/)).toBeInTheDocument();
  });
});
