// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { flowLayoutOf, type FlowNode, type FlowStep, NODE_H } from "./flowLayout";

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

  it("carries the same line states as the horizontal layout for the lines into each box", () => {
    const wide = flowLayoutOf(fanned, "horizontal");
    const tall = flowLayoutOf(fanned, "vertical");
    expect(edgeOf(tall, "in:carol").state).toBe(edgeOf(wide, "in:carol").state);
    expect(edgeOf(tall, "in:publish").state).toBe(edgeOf(wide, "in:publish").state);
    expect(edgeOf(tall, "link:dave").state).toBe(edgeOf(wide, "in:dave").state);
  });

  it("runs every line straight down one axis, fans included (#80)", () => {
    const layout = flowLayoutOf(fanned, "vertical");
    for (const edge of layout.edges) expect(edge.d).toMatch(/^M[\d.]+,[\d.]+ V[\d.]+$/);
    const axes = new Set(layout.edges.map((edge) => edge.d.match(/^M([\d.]+),/)![1]));
    expect(axes.size).toBe(1);
  });
});

const member = (id: string) => ({ id, name: id, state: "upcoming" as const });

describe("the flow layout with an expanded group", () => {
  const group: FlowNode = {
    ...node("team", "current"),
    members: [member("m1"), member("m2"), member("m3")],
  };
  const steps = [
    step("s", node("submitted", "done")),
    step("mix", group, node("solo", "current")),
    step("next", node("ceo", "upcoming")),
  ];

  it("keeps a collapsed group box at the normal height", () => {
    expect(nodeOf(flowLayoutOf(steps, "horizontal"), "team").h).toBe(NODE_H);
  });

  it("makes an expanded group taller by its members and pushes the box below it down", () => {
    const closed = flowLayoutOf(steps, "horizontal");
    const open = flowLayoutOf(steps, "horizontal", new Set(["team"]));
    expect(nodeOf(open, "team").h).toBeGreaterThan(NODE_H);
    expect(nodeOf(open, "solo").y - nodeOf(open, "team").y).toBeGreaterThan(
      nodeOf(closed, "solo").y - nodeOf(closed, "team").y,
    );
    expect(open.height).toBeGreaterThan(closed.height);
  });

  it("grows the vertical layout too, and joins the lines at the bottom of the taller box", () => {
    const open = flowLayoutOf(steps, "vertical", new Set(["team"]));
    const team = nodeOf(open, "team");
    expect(team.h).toBeGreaterThan(NODE_H);
    expect(nodeOf(open, "ceo").y).toBeGreaterThan(team.y + team.h);
    expect(open.height).toBeGreaterThan(flowLayoutOf(steps, "vertical").height);
  });

  it("ignores an expanded id that has no members", () => {
    const open = flowLayoutOf(steps, "horizontal", new Set(["solo"]));
    expect(nodeOf(open, "solo").h).toBe(NODE_H);
  });

  it("lets a line meet the header of an expanded box, not its middle", () => {
    const open = flowLayoutOf(steps, "horizontal", new Set(["team"]));
    const team = nodeOf(open, "team");
    // The step mixes a group and a user, so the one line goes into the outer box, at its middle.
    const frame = open.frames[0]!;
    expect(edgeOf(open, `in:${frame.id}`).d).toContain(`H${frame.x}`);
    expect(team.y).toBeGreaterThan(frame.y);
  });
});

const frameStateOf = (a: FlowNode["state"], b: FlowNode["state"]) =>
  flowLayoutOf(
    [
      step("s", node("submitted", "done")),
      step(
        "mix",
        { ...node("team", a), members: [{ id: "m1", name: "m1", state: "upcoming" }] },
        node("solo", b),
      ),
    ],
    "horizontal",
  ).frames[0]!.state;

describe("the outer box around a mixed step", () => {
  const group: FlowNode = {
    ...node("team", "current"),
    members: [{ id: "m1", name: "m1", state: "upcoming" }],
  };
  const mixed = step("mix", group, node("solo", "done"));
  const steps = (...middle: FlowStep[]) => [step("s", node("submitted", "done")), ...middle];

  it("draws one frame around a step that mixes a user and a group, with the step's tally", () => {
    const layout = flowLayoutOf(
      steps({ ...mixed, tally: "2/4" }, step("next", node("ceo", "upcoming"))),
      "horizontal",
    );
    expect(layout.frames).toHaveLength(1);
    const frame = layout.frames[0]!;
    const team = nodeOf(layout, "team");
    const solo = nodeOf(layout, "solo");
    expect(frame.stepIndex).toBe(1);
    expect(frame.tally).toBe("2/4");
    expect(frame.x).toBeLessThan(team.x);
    expect(frame.x + frame.w).toBeGreaterThan(team.x + team.w);
    expect(frame.y).toBeLessThan(team.y);
    expect(frame.y + frame.h).toBeGreaterThan(solo.y + solo.h);
  });

  it("draws none for a single box, a plain fan of users, or a step with only groups", () => {
    const users = step("fan", node("a", "done"), node("b", "current"));
    const groups = step("gs", group, { ...group, id: "team2" });
    expect(flowLayoutOf(steps(step("one", group)), "horizontal").frames).toEqual([]);
    expect(flowLayoutOf(steps(users), "horizontal").frames).toEqual([]);
    expect(flowLayoutOf(steps(groups), "horizontal").frames).toEqual([]);
  });

  it("follows the boxes inside it: rejected if any is, done when all are, else current", () => {
    expect(frameStateOf("done", "done")).toBe("done");
    expect(frameStateOf("done", "rejected")).toBe("rejected");
    expect(frameStateOf("current", "done")).toBe("current");
    expect(frameStateOf("upcoming", "upcoming")).toBe("upcoming");
  });

  it("grows with an expanded group and keeps the vertical form inside its width", () => {
    const closed = flowLayoutOf(steps(mixed), "vertical");
    const open = flowLayoutOf(steps(mixed), "vertical", new Set(["team"]));
    expect(open.frames[0]!.h).toBeGreaterThan(closed.frames[0]!.h);
    expect(open.frames[0]!.x).toBeGreaterThanOrEqual(0);
    expect(open.frames[0]!.x + open.frames[0]!.w).toBeLessThanOrEqual(open.width);
  });
});

describe("arrowheads and the one line of a mixed step", () => {
  const group: FlowNode = {
    ...node("team", "current"),
    members: [{ id: "m1", name: "m1", state: "upcoming" }],
  };
  const mixed = [
    step("s", node("submitted", "done")),
    step("mix", group, node("solo", "done")),
    step("next", node("ceo", "upcoming")),
  ];

  it("puts an arrowhead on every line that ends at a box, and none where lines only join (#77)", () => {
    for (const orientation of ["horizontal", "vertical"] as const) {
      const layout = flowLayoutOf(
        [...chain, step("fan", node("a", "upcoming"), node("b", "upcoming"))],
        orientation,
      );
      for (const edge of layout.edges) {
        expect(edge.arrow).toBe(!edge.id.startsWith("out:"));
      }
    }
  });

  it("draws one line into and one line out of the outer box of a mixed step (#78)", () => {
    for (const orientation of ["horizontal", "vertical"] as const) {
      const layout = flowLayoutOf(mixed, orientation);
      const ids = layout.edges.map((edge) => edge.id).toSorted();
      expect(ids).toEqual(["in:frame:mix", "in:ceo", "out:frame:mix", "out:submitted"].toSorted());
    }
  });

  it("keeps the fan of lines for a step of only users (#78)", () => {
    const layout = flowLayoutOf(
      [step("s", node("submitted", "done")), step("fan", node("a", "done"), node("b", "done"))],
      "horizontal",
    );
    expect(layout.edges.map((edge) => edge.id).toSorted()).toEqual(
      ["in:a", "in:b", "out:submitted"].toSorted(),
    );
  });
});
