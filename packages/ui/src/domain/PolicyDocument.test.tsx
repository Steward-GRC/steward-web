// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { PolicyAppendix } from "./policyReaderModel";

import { PolicyAppendices, PolicyDocument } from "./PolicyDocument";

const appendix = (letter: string, title: string): PolicyAppendix =>
  ({ blocks: [], id: `appendix-${letter}`, letter, text: "Rates.", title }) as PolicyAppendix;

const label = (a: PolicyAppendix) => `Appendix ${a.letter}: ${a.title}`;
const mount = (ui: React.ReactNode) => <MemoryRouter>{ui}</MemoryRouter>;
const body = [{ depth: 1, kind: "heading", sectionKey: "purpose", text: "Purpose" }] as never;

describe("the line between the sections and the appendices (bug log 225)", () => {
  it("draws one line before the appendices when there is at least one", () => {
    render(
      mount(
        <PolicyDocument
          appendices={[appendix("A", "Desk zones"), appendix("B", "Rates")]}
          appendixLabel={label}
          blocks={body}
          definitions={[]}
        />,
      ),
    );
    expect(screen.getAllByRole("separator")).toHaveLength(1);
    expect(screen.getByText("Appendix A: Desk zones")).toBeInTheDocument();
  });

  it("draws no line when there is no appendix", () => {
    render(
      mount(
        <PolicyDocument appendices={[]} appendixLabel={label} blocks={body} definitions={[]} />,
      ),
    );
    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("is the same line wherever the appendices are shown on their own", () => {
    const { rerender } = render(
      mount(<PolicyAppendices appendices={[]} appendixLabel={label} definitions={[]} />),
    );
    expect(screen.queryByRole("separator")).toBeNull();
    rerender(
      mount(
        <PolicyAppendices
          appendices={[appendix("A", "Desk zones")]}
          appendixLabel={label}
          definitions={[]}
        />,
      ),
    );
    expect(screen.getAllByRole("separator")).toHaveLength(1);
  });
});
