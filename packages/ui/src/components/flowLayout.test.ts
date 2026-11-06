// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { flowLayoutOf, type FlowNode, type FlowStep } from "./flowLayout";

const node = (id: string, state: FlowNode["state"]): FlowNode => ({ id, state, title: id });
const step = (id: string, ...nodes: FlowNode[]): FlowStep => ({ id, nodes });

const edgeOf = (layout: ReturnType<typeof flowLayoutOf>, id: string) =>
  layout.edges.find((edge) => edge.id === id)!;
const nodeOf = (layout: ReturnType<typeof flowLayoutOf>, id: string) =>
  layout.nodes.find((n) => n.id === id)!;

const chain = [
  step("s", node("submitted", "done")),
  step("a", node("legal", "done")),
  step("b", node("finance", "current")),
  step("c", node("ceo", "upcoming")),
];

const fan = (second: FlowNode["state"]) =>
  flowLayoutOf(
    [
      step("s", node("submitted", "done")),
      step("fan", node("carol", "done"), node("dave", second)),
      step("next", node("ceo", "current")),
    ],
    "horizontal",
  );

describe("the flow layout, horizontal", () => {
  it("puts one step per column, left to right, on one line for a single chain", () => {
    const layout = flowLayoutOf(chain, "horizontal");
    const xs = layout.nodes.map((n) => n.x);
    expect(xs).toEqual(xs.toSorted((a, b) => a - b));
    expect(new Set(xs).size).toBe(4);
    expect(new Set(layout.nodes.map((n) => n.y)).size).toBe(1);
  });

  it("joins each pair of neighbours by a line out of one and a line into the other", () => {
    const layout = flowLayoutOf(chain, "horizontal");
    expect(layout.edges.map((edge) => edge.id).toSorted()).toEqual(
      ["in:ceo", "in:finance", "in:legal", "out:finance", "out:legal", "out:submitted"].toSorted(),
    );
  });

  it("fans parallel approvers out into one box each, stacked and centred on the flow line", () => {
    const layout = flowLayoutOf(
      [
        step("s", node("submitted", "done")),
        step("fan", node("carol", "done"), node("dave", "current"), node("erin", "current")),
        step("end", node("publish", "upcoming")),
      ],
      "horizontal",
    );
    const [carol, dave, erin] = ["carol", "dave", "erin"].map((id) => nodeOf(layout, id));
    expect(new Set([carol!.x, dave!.x, erin!.x]).size).toBe(1);
    expect(dave!.y).toBeGreaterThan(carol!.y);
    expect(erin!.y).toBeGreaterThan(dave!.y);
    const submitted = nodeOf(layout, "submitted");
    expect(dave!.y + dave!.h / 2).toBeCloseTo(submitted.y + submitted.h / 2);
    // The line splits into one per approver and rejoins: three in, three out.
    expect(layout.edges.filter((edge) => edge.id.startsWith("in:")).length).toBe(4);
    expect(layout.edges.filter((edge) => edge.id.startsWith("out:")).length).toBe(4);
  });

  it("runs each line from the right edge of one box to the left edge of the next, meeting midway", () => {
    const layout = flowLayoutOf(chain, "horizontal");
    const [from, to] = [nodeOf(layout, "legal"), nodeOf(layout, "finance")];
    const midway = (from.x + from.w + to.x) / 2;
    const out = edgeOf(layout, "out:legal").d;
    const into = edgeOf(layout, "in:finance").d;
    expect(out.startsWith(`M${from.x + from.w},${from.y + from.h / 2} H${midway}`)).toBe(true);
    expect(into.startsWith(`M${midway},`)).toBe(true);
    expect(into.endsWith(`H${to.x}`)).toBe(true);
  });

  it("sizes the canvas to hold every box", () => {
    const layout = flowLayoutOf(chain, "horizontal");
    for (const n of layout.nodes) {
      expect(n.x + n.w).toBeLessThanOrEqual(layout.width);
      expect(n.y + n.h).toBeLessThanOrEqual(layout.height);
    }
  });
});

describe("the flow layout, highlight", () => {
  it("lights the path taken, makes the line into the current step active and leaves the rest dim", () => {
    const layout = flowLayoutOf(chain, "horizontal");
    expect(edgeOf(layout, "out:submitted").state).toBe("taken");
    expect(edgeOf(layout, "in:legal").state).toBe("taken");
    expect(edgeOf(layout, "out:legal").state).toBe("taken");
    expect(edgeOf(layout, "in:finance").state).toBe("active");
    expect(edgeOf(layout, "out:finance").state).toBe("ahead");
    expect(edgeOf(layout, "in:ceo").state).toBe("ahead");
  });

  it("lights the next step only when every approver in the fan is done", () => {
    expect(edgeOf(fan("current"), "in:ceo").state).toBe("ahead");
    expect(edgeOf(fan("done"), "in:ceo").state).toBe("active");
    expect(edgeOf(fan("done"), "out:dave").state).toBe("taken");
    expect(edgeOf(fan("current"), "out:dave").state).toBe("ahead");
    expect(edgeOf(fan("current"), "out:carol").state).toBe("taken");
  });

  it("keeps the line into a rejected step as the path taken and lights nothing after it", () => {
    const layout = flowLayoutOf(
      [
        step("s", node("submitted", "done")),
        step("a", node("legal", "rejected")),
        step("b", node("ceo", "upcoming")),
      ],
      "horizontal",
    );
    expect(edgeOf(layout, "in:legal").state).toBe("taken");
    expect(edgeOf(layout, "out:legal").state).toBe("ahead");
    expect(edgeOf(layout, "in:ceo").state).toBe("ahead");
  });
});

describe("the flow layout, vertical (phone)", () => {
  const fanned: FlowStep[] = [
    step("s", node("submitted", "done")),
    step("fan", node("carol", "done"), node("dave", "current")),
    step("end", node("publish", "upcoming")),
  ];

  it("stacks every box top to bottom, fans included", () => {
    const layout = flowLayoutOf(fanned, "vertical");
    const ys = ["submitted", "carol", "dave", "publish"].map((id) => nodeOf(layout, id).y);
    expect(ys).toEqual(ys.toSorted((a, b) => a - b));
    expect(new Set(ys).size).toBe(4);
  });

  it("is narrow enough for a phone and keeps every box inside it", () => {
    const layout = flowLayoutOf(fanned, "vertical");
    expect(layout.width).toBeLessThanOrEqual(288);
    for (const n of layout.nodes) expect(n.x + n.w).toBeLessThanOrEqual(layout.width);
  });

  it("carries the same line states as the horizontal layout", () => {
    const wide = flowLayoutOf(fanned, "horizontal");
    const tall = flowLayoutOf(fanned, "vertical");
    expect(tall.edges.map((edge) => [edge.id, edge.state])).toEqual(
      wide.edges.map((edge) => [edge.id, edge.state]),
    );
  });
});
