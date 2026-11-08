// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { StartEditing } from "./StartEditing";

const policy = {
  documentType: "POLICY",
  id: "policy-1",
  number: "POL-EXPENSES-000002",
  title: "Expense Claims Policy",
  version: "2.0.0",
};

const mount = (appendices: never[] = [], record: object = {}) => {
  const posted = vi.fn();
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return { ok: true };
      },
      Component: () => (
        <StartEditing appendices={appendices} policy={{ ...policy, ...record } as never} />
      ),
      path: "/",
    },
  ]);
  render(<Stub />);
  return posted;
};

describe("the edit screen before a draft exists (bug log 219)", () => {
  it("shows the document and what starting does, and posts nothing by itself", () => {
    const posted = mount();
    expect(screen.getByRole("heading", { name: "Expense Claims Policy" })).toBeInTheDocument();
    expect(screen.getByText(/POL-EXPENSES-000002/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start editing" })).toBeInTheDocument();
    expect(posted).not.toHaveBeenCalled();
  });

  it("starts the draft only when Start editing is pressed", async () => {
    const posted = mount();
    await userEvent.click(screen.getByRole("button", { name: "Start editing" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalledWith({ intent: "edit" }));
  });

  it("lets the appendices be added and edited with no draft", () => {
    mount();
    expect(screen.getByRole("button", { name: "Add appendix" })).toBeInTheDocument();
  });

  it("names a procedure as a procedure", () => {
    mount([], { documentType: "PROCEDURE" });
    expect(screen.getByText(/draft of the procedure/)).toBeInTheDocument();
  });

  it("names a policy as a policy", () => {
    mount();
    expect(screen.getByText(/draft of the policy/)).toBeInTheDocument();
  });

  it("does not print a bare v when no version is known", () => {
    mount([], { version: null });
    expect(screen.queryByText(/v\./)).toBeNull();
    expect(screen.queryByText(/published version/)).toBeNull();
  });
});
