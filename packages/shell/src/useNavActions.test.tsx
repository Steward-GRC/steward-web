// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { CommandActionsProvider, useCommandActions } from "@steward-web/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import { useRegisterCreateActions, useRegisterNavActions } from "./useNavActions";

const Page = () => {
  useRegisterNavActions([
    { id: "create", label: "New thing", shortcut: "create", to: "/things/new" },
    { allowed: false, id: "hidden", label: "Not for you", to: "/nope" },
  ]);
  const listed = useCommandActions();
  return (
    <>
      <p>at {useLocation().pathname}</p>
      <ul>
        {listed.map((action) => (
          <li key={action.id}>
            <button onClick={action.run} type="button">
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

const mount = () => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <CommandActionsProvider>
          <Page />
        </CommandActionsProvider>
      ),
      path: "*",
    },
  ]);
  render(<Stub initialEntries={["/things"]} />);
};

describe("a page's navigation actions for the command bar", () => {
  it("lists what is allowed and drops what is not", async () => {
    mount();
    expect(await screen.findByRole("button", { name: "New thing" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Not for you" })).toBeNull();
  });

  it("goes to the address when run, from the bar or from its shortcut key", async () => {
    mount();
    await userEvent.click(await screen.findByRole("button", { name: "New thing" }));
    expect(await screen.findByText("at /things/new")).toBeInTheDocument();
  });

  it("runs on its shortcut", async () => {
    mount();
    await screen.findByRole("button", { name: "New thing" });
    await userEvent.keyboard("{Shift>}C{/Shift}");
    expect(await screen.findByText("at /things/new")).toBeInTheDocument();
  });
});

const Creates = ({ app, ids }: { app: "admin" | "staff"; ids: string[] }) => {
  useRegisterCreateActions(app, ids);
  return (
    <ul>
      {useCommandActions().map((action) => (
        <li key={action.id}>{action.label}</li>
      ))}
    </ul>
  );
};

const mountCreates = (
  app: "admin" | "staff",
  ids: string[],
  identity: Partial<typeof NO_ACCESS>,
) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <IdentityProvider identity={{ ...NO_ACCESS, ...identity }}>
          <CommandActionsProvider>
            <Creates app={app} ids={ids} />
          </CommandActionsProvider>
        </IdentityProvider>
      ),
      path: "*",
    },
  ]);
  render(<Stub initialEntries={["/"]} />);
};

describe("a page's create actions", () => {
  it("offers an author the creates the page is about, and no others", async () => {
    mountCreates("staff", ["policy", "procedure"], {
      permissions: new Set(["policy.author"]),
    });
    expect(await screen.findByText("New policy")).toBeInTheDocument();
    expect(screen.getByText("New procedure")).toBeInTheDocument();
    expect(screen.queryByText("New draft from a template")).toBeNull();
  });

  it("offers nothing to someone who may not author", async () => {
    mountCreates("staff", ["policy"], {});
    await Promise.resolve();
    expect(screen.queryByText("New policy")).toBeNull();
  });

  it("offers a site admin the admin creates", async () => {
    mountCreates("admin", ["category", "organisation"], { isSiteAdmin: true });
    expect(await screen.findByText("New category")).toBeInTheDocument();
    expect(screen.getByText("New organisation")).toBeInTheDocument();
  });
});
