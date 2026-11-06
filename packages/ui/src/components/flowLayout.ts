// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The geometry and the highlight rules of the read-only flow view. Pure, so both are tested
// without a DOM. Sizes are in px at a 16px root; the view converts them to rem.

export type FlowEdgeState = "active" | "ahead" | "taken";

export interface FlowNode {
  /** What the approver wrote with their decision; read aloud and on hover, not drawn. */
  comment?: null | string;
  id: string;
  state: FlowNodeState;
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
}

export interface PlacedEdge {
  d: string;
  id: string;
  state: FlowEdgeState;
}

export interface PlacedNode extends FlowNode {
  h: number;
  stepIndex: number;
  w: number;
  x: number;
  y: number;
}

export const NODE_H = 76;
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

const stackHeight = (count: number) => count * NODE_H + (count - 1) * GAP_Y;

/** Where each box and line goes. Horizontal runs left to right; vertical is the phone form. */
export const flowLayoutOf = (
  steps: readonly FlowStep[],
  orientation: FlowOrientation,
): { edges: PlacedEdge[]; height: number; nodes: PlacedNode[]; width: number } => {
  const nodes: PlacedNode[] = [];
  const edges: PlacedEdge[] = [];
  const last = steps.length - 1;

  if (orientation === "horizontal") {
    const height = Math.max(...steps.map((s) => stackHeight(s.nodes.length)));
    const mid = height / 2;
    for (const [index, step] of steps.entries()) {
      const x = index * (NODE_W + GAP_X);
      const top = mid - stackHeight(step.nodes.length) / 2;
      const jx = x + NODE_W + GAP_X / 2;
      const lit = litBefore(steps, index);
      for (const [row, node] of step.nodes.entries()) {
        const y = top + row * (NODE_H + GAP_Y);
        const cy = y + NODE_H / 2;
        nodes.push({ ...node, h: NODE_H, stepIndex: index, w: NODE_W, x, y });
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
    return { edges, height, nodes, width: steps.length * NODE_W + last * GAP_X };
  }

  const cx = V_NODE_X + V_NODE_W / 2;
  const railL = V_RAIL;
  const railR = V_WIDTH - V_RAIL;
  let cursor = 0;
  for (const [index, step] of steps.entries()) {
    const fan = step.nodes.length > 1;
    const bottom = cursor + stackHeight(step.nodes.length);
    const joinY = bottom + V_GAP / 2;
    const lit = litBefore(steps, index);
    for (const [row, node] of step.nodes.entries()) {
      const y = cursor + row * (NODE_H + GAP_Y);
      const cy = y + NODE_H / 2;
      nodes.push({ ...node, h: NODE_H, stepIndex: index, w: V_NODE_W, x: V_NODE_X, y });
      if (index > 0) {
        const fromY = cursor - V_GAP / 2;
        edges.push({
          d: fan ? `M${cx},${fromY} H${railL} V${cy} H${V_NODE_X}` : `M${cx},${fromY} V${y}`,
          id: `in:${node.id}`,
          state: into(node, lit),
        });
      }
      if (index < last) {
        edges.push({
          d: fan
            ? `M${V_NODE_X + V_NODE_W},${cy} H${railR} V${joinY} H${cx}`
            : `M${cx},${y + NODE_H} V${joinY}`,
          id: `out:${node.id}`,
          state: out(node),
        });
      }
    }
    cursor = bottom + V_GAP;
  }
  return { edges, height: cursor - V_GAP, nodes, width: V_WIDTH };
};
