// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { DraftReviewActions, type DraftReviewActionsProps } from "./DraftReviewActions";

const ready: DraftReviewActionsProps = {
  blocked: false,
  canPublish: true,
  canSubmit: true,
  inReview: false,
};

type Answer = Record<string, unknown>;

const renderActions = (
  props: Partial<DraftReviewActionsProps> = {},
  answer: (intent: string) => Answer = (intent) => ({ intent, ok: true }),
) => {
  const intents: string[] = [];
  const action = vi.fn(async ({ request }: { request: Request }) => {
    const form = await request.formData();
    const intent = String(form.get("intent"));
    intents.push(intent);
    return answer(intent);
  });
  const Stub = createRoutesStub([
    {
      action,
      Component: () => <DraftReviewActions {...ready} {...props} />,
      path: "/drafts/p-1",
    },
  ]);
  render(<Stub initialEntries={["/drafts/p-1"]} />);
  return { intents };
};

describe("DraftReviewActions", () => {
  it("offers both submit for review and publish to an author of a draft not yet in review", () => {
    renderActions();
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();
  });

  it("posts the submit-review intent when submit for review is pressed", async () => {
    const { intents } = renderActions();
    await userEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    await waitFor(() => expect(intents).toEqual(["submit-review"]));
  });

  it("posts the publish intent when publish is pressed", async () => {
    const { intents } = renderActions();
    await userEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => expect(intents).toEqual(["publish"]));
  });

  it("disables both while a required section is empty or the room is read-only", () => {
    renderActions({ blocked: true });
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
  });

  it("leaves out submit for review for a caller the gateway doesn't let submit", () => {
    renderActions({ canSubmit: false });
    expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
  });

  it("leaves out publish for a caller the gateway doesn't let publish", () => {
    renderActions({ canPublish: false });
    expect(screen.queryByRole("button", { name: "Publish" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeInTheDocument();
  });

  it("shows a draft in review as in review, with neither action on offer", () => {
    renderActions({ inReview: true });
    expect(screen.getByText("In review")).toBeInTheDocument();
    expect(screen.getByText(/approvers see it in Approvals/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publish" })).not.toBeInTheDocument();
  });

  it("explains a refusal when no workflow can take the draft", async () => {
    renderActions({}, (intent) => ({
      error: { code: "FAILED_PRECONDITION", operation: "SubmitWorkflow" },
      intent,
      ok: false,
    }));
    await userEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    expect(await screen.findByText("This draft can't go for review yet")).toBeInTheDocument();
    expect(screen.getByText(/no approval workflow applies/i)).toBeInTheDocument();
  });

  it("says so when a publish is refused", async () => {
    renderActions({}, (intent) => ({ error: { status: 403 }, intent, ok: false }));
    await userEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(await screen.findByText("The draft wasn't published")).toBeInTheDocument();
  });
});
