// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The geometry and the highlight rules of the read-only flow view. Pure, so both are tested
// without a DOM. Sizes are in px at a 16px root; the view converts them to rem.

export type FlowEdgeState = "active" | "ahead" | "taken";

/** One member of a group, with the vote they have cast so far. */
export interface FlowMember {
  id: string;
  name: string;
  state: FlowNodeState;
  /** When they decided, if known. */
  when?: null | string;
}

export interface FlowNode {
  /** What the approver wrote with their decision; read aloud and on hover, not drawn. */
  comment?: null | string;
  /** The second line: the step (what it does), under the user or group name in `title`. */
  description?: null | string;
  id: string;
  /** Present on a group: its members, shown when the box is expanded. */
  members?: readonly FlowMember[];
  state: FlowNodeState;
  /** A group's current vote against its quorum, small on the box: "2/3". */
  tally?: null | string;
  /** The user or group name. */
  title: string;
  /** The third line: when, or the due date. */
  when?: null | string;
  /** The second line: who. */
  who?: null | string;
}

export type FlowNodeState = "current" | "done" | "rejected" | "upcoming";

export type FlowOrientation = "horizontal" | "vertical";

export interface FlowStep {
  id: string;
  /** More than one node is a parallel step: the line splits to one box each and rejoins. */
  nodes: readonly FlowNode[];
  /** The whole step's vote across its boxes, drawn on the outer box of a mixed step. */
  tally?: null | string;
  /** The same, worded for a screen reader. */
  tallyLabel?: null | string;
}

export interface PlacedEdge {
  d: string;
  id: string;
  state: FlowEdgeState;
}

/** The outer box around a step that mixes users and groups. */
export interface PlacedFrame {
  h: number;
  id: string;
  state: FlowNodeState;
  stepIndex: number;
  tally: null | string;
  w: number;
  x: number;
  y: number;
}

export interface PlacedNode extends FlowNode {
  h: number;
  stepIndex: number;
  w: number;
  x: number;
  y: number;
}

export const NODE_H = 76;
export const MEMBER_H = 36;
export const MEMBERS_PAD = 8;
const FRAME_PAD = 8;
const FRAME_HEAD = 22;
const NODE_W = 184;
const GAP_X = 64;
const GAP_Y = 16;
const V_WIDTH = 272;
const V_NODE_W = 208;
const V_NODE_X = 32;
const V_RAIL = 12;
const V_GAP = 40;

/** Lit only once every box before it is done: a fan's next step waits for all of its approvers. */
const litBefore = (steps: readonly FlowStep[], index: number): boolean =>
  steps.slice(0, index).every((s) => s.nodes.every((n) => n.state === "done"));

const into = (node: FlowNode, lit: boolean): FlowEdgeState => {
  if (!lit) return "ahead";
  if (node.state === "current") return "active";
  return node.state === "upcoming" ? "ahead" : "taken";
};

const out = (node: FlowNode): FlowEdgeState => (node.state === "done" ? "taken" : "ahead");

/** A group box grows by a row per member while expanded. */
export const heightOf = (node: FlowNode, expanded: ReadonlySet<string>): number =>
  node.members?.length && expanded.has(node.id)
    ? NODE_H + node.members.length * MEMBER_H + MEMBERS_PAD
    : NODE_H;

/** A step with both a group and a plain user gets one outer box around all of them. */
const isMixed = (step: FlowStep): boolean =>
  step.nodes.some((n) => n.members !== undefined) &&
  step.nodes.some((n) => n.members === undefined);

const frameState = (nodes: readonly FlowNode[]): FlowNodeState => {
  if (nodes.some((n) => n.state === "rejected")) return "rejected";
  if (nodes.every((n) => n.state === "done")) return "done";
  return nodes.every((n) => n.state === "upcoming") ? "upcoming" : "current";
};

/** The boxes' stack, and how far the frame (when there is one) pushes it down and out. */
const sizeOf = (step: FlowStep, expanded: ReadonlySet<string>) => {
  const inner =
    step.nodes.reduce((sum, n) => sum + heightOf(n, expanded), 0) + (step.nodes.length - 1) * GAP_Y;
  const framed = isMixed(step);
  const head = framed ? FRAME_HEAD + FRAME_PAD : 0;
  return { framed, head, inner, outer: inner + (framed ? head + FRAME_PAD : 0) };
};

const frameOf = (
  step: FlowStep,
  stepIndex: number,
  box: { h: number; w: number; x: number; y: number },
): PlacedFrame => ({
  ...box,
  id: `frame:${step.id}`,
  state: frameState(step.nodes),
  stepIndex,
  tally: step.tally ?? null,
});

/** Where each box and line goes. Horizontal runs left to right; vertical is the phone form. */
export const flowLayoutOf = (
  steps: readonly FlowStep[],
  orientation: FlowOrientation,
  expanded: ReadonlySet<string> = new Set(),
): {
  edges: PlacedEdge[];
  frames: PlacedFrame[];
  height: number;
  nodes: PlacedNode[];
  width: number;
} => {
  const nodes: PlacedNode[] = [];
  const edges: PlacedEdge[] = [];
  const frames: PlacedFrame[] = [];
  const last = steps.length - 1;

  if (orientation === "horizontal") {
    const sizes = steps.map((s) => sizeOf(s, expanded));
    const height = Math.max(...sizes.map((z) => z.outer));
    const mid = height / 2;
    for (const [index, step] of steps.entries()) {
      const x = index * (NODE_W + GAP_X);
      const size = sizes[index]!;
      const top = mid - size.outer / 2;
      const jx = x + NODE_W + GAP_X / 2;
      const lit = litBefore(steps, index);
      if (size.framed) {
        frames.push(
          frameOf(step, index, {
            h: size.outer,
            w: NODE_W + 2 * FRAME_PAD,
            x: x - FRAME_PAD,
            y: top,
          }),
        );
      }
      let y = top + size.head;
      for (const node of step.nodes) {
        const h = heightOf(node, expanded);
        const cy = y + NODE_H / 2;
        nodes.push({ ...node, h, stepIndex: index, w: NODE_W, x, y });
        y += h + GAP_Y;
        if (index > 0) {
          edges.push({
            d: `M${x - GAP_X / 2},${mid} V${cy} H${x}`,
            id: `in:${node.id}`,
            state: into(node, lit),
          });
        }
        if (index < last) {
          edges.push({
            d: `M${x + NODE_W},${cy} H${jx} V${mid}`,
            id: `out:${node.id}`,
            state: out(node),
          });
        }
      }
    }
    return { edges, frames, height, nodes, width: steps.length * NODE_W + last * GAP_X };
  }

  const cx = V_NODE_X + V_NODE_W / 2;
  const railL = V_RAIL;
  const railR = V_WIDTH - V_RAIL;
  let cursor = 0;
  for (const [index, step] of steps.entries()) {
    const fan = step.nodes.length > 1;
    const size = sizeOf(step, expanded);
    const bottom = cursor + size.outer;
    const joinY = bottom + V_GAP / 2;
    const lit = litBefore(steps, index);
    if (size.framed) {
      frames.push(
        frameOf(step, index, {
          h: size.outer,
          w: V_NODE_W + 2 * FRAME_PAD,
          x: V_NODE_X - FRAME_PAD,
          y: cursor,
        }),
      );
    }
    let y = cursor + size.head;
    for (const node of step.nodes) {
      const h = heightOf(node, expanded);
      const cy = y + NODE_H / 2;
      nodes.push({ ...node, h, stepIndex: index, w: V_NODE_W, x: V_NODE_X, y });
      const top = y;
      y += h + GAP_Y;
      if (index > 0) {
        const fromY = cursor - V_GAP / 2;
        edges.push({
          d: fan ? `M${cx},${fromY} H${railL} V${cy} H${V_NODE_X}` : `M${cx},${fromY} V${top}`,
          id: `in:${node.id}`,
          state: into(node, lit),
        });
      }
      if (index < last) {
        edges.push({
          d: fan
            ? `M${V_NODE_X + V_NODE_W},${cy} H${railR} V${joinY} H${cx}`
            : `M${cx},${top + h} V${joinY}`,
          id: `out:${node.id}`,
          state: out(node),
        });
      }
    }
    cursor = bottom + V_GAP;
  }
  return { edges, frames, height: cursor - V_GAP, nodes, width: V_WIDTH };
};
