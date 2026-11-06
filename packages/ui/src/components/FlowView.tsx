// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Check, CircleDashed, Clock, X } from "lucide-react";

import { cn } from "#ui/lib/cn";
import { PHONE, useMediaQuery } from "#ui/lib/media";

import {
  type FlowEdgeState,
  flowLayoutOf,
  type FlowNode,
  type FlowNodeState,
  type FlowOrientation,
  type FlowStep,
} from "./flowLayout";

export type { FlowNode, FlowNodeState, FlowStep } from "./flowLayout";

export interface FlowViewProps {
  /** The last box, if the flow has an end ("Publish"). */
  end?: FlowNode;
  /** Names the flow for screen readers and the list that stands in for the drawing. */
  label: string;
  /** Horizontal on wide screens and vertical on a phone, unless forced. */
  orientation?: "auto" | FlowOrientation;
  /** The first box, always: "Submitted". */
  start: FlowNode;
  /** The words a screen reader hears for each state. */
  stateLabels: Record<FlowNodeState, string>;
  steps: readonly FlowStep[];
}

const rem = (px: number) => `${px / 16}rem`;

const EDGE: Record<FlowEdgeState, string> = {
  active: "flow-active stroke-accent motion-reduce:animate-none",
  ahead: "stroke-border-strong opacity-60",
  taken: "stroke-primary",
};
const EDGE_WIDTH: Record<FlowEdgeState, number> = { active: 5, ahead: 2, taken: 3 };
const EDGE_ORDER: Record<FlowEdgeState, number> = { active: 2, ahead: 0, taken: 1 };

const BOX: Record<FlowNodeState, string> = {
  current:
    "border-accent bg-surface shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_35%,transparent)]",
  done: "border-primary bg-primary-soft",
  rejected: "border-danger bg-danger-soft",
  upcoming: "border-dashed border-border-strong bg-surface opacity-60",
};

const Mark = ({ state }: { state: FlowNodeState }) => {
  const Icon =
    state === "done"
      ? Check
      : state === "rejected"
        ? X
        : state === "current"
          ? Clock
          : CircleDashed;
  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0",
        state === "done" && "text-primary",
        state === "rejected" && "text-danger",
        state === "current" && "text-accent",
        state === "upcoming" && "text-muted",
      )}
    />
  );
};

/** What a screen reader gets for one box: "Legal, Carol, 2 Oct: Done". */
const spoken = (node: FlowNode, stateLabels: FlowViewProps["stateLabels"]): string =>
  `${[node.title, node.who, node.when].filter(Boolean).join(", ")}: ${stateLabels[node.state]}${
    node.comment ? `. “${node.comment}”` : ""
  }`;

/**
 * A read-only flow: boxes joined by lines, drawn with SVG and CSS (not an editor). It always
 * starts with the start box. The path taken is purple, the current step amber with the line
 * into it bolder and animated, and what is still to come is dim. A step with several boxes is
 * a fan: the line splits to one box each and rejoins, and the next step lights up only once
 * every one of them is done. Screen readers get the same flow as a list.
 */
export const FlowView = ({
  end,
  label,
  orientation = "auto",
  start,
  stateLabels,
  steps,
}: FlowViewProps) => {
  const phone = useMediaQuery(PHONE);
  const resolved: FlowOrientation =
    orientation === "auto" ? (phone ? "vertical" : "horizontal") : orientation;
  const all: FlowStep[] = [
    { id: "start", nodes: [start] },
    ...steps,
    ...(end ? [{ id: "end", nodes: [end] }] : []),
  ];
  const layout = flowLayoutOf(all, resolved);
  const spokenNodes = all.flatMap((s) => s.nodes);

  return (
    <div className="max-w-full overflow-x-auto overflow-y-hidden pb-1">
      <ol aria-label={label} className="sr-only">
        {spokenNodes.map((node) => (
          <li aria-current={node.state === "current" ? "step" : undefined} key={node.id}>
            {spoken(node, stateLabels)}
          </li>
        ))}
      </ol>
      <div
        aria-hidden="true"
        className="relative mx-auto"
        data-flow-canvas=""
        data-orientation={resolved}
        style={{ height: rem(layout.height), width: rem(layout.width) }}
      >
        <svg
          className="absolute inset-0 size-full fill-none"
          preserveAspectRatio="none"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
        >
          {layout.edges
            .toSorted((a, b) => EDGE_ORDER[a.state] - EDGE_ORDER[b.state])
            .map((edge) => (
              <path
                className={EDGE[edge.state]}
                d={edge.d}
                data-flow-edge={edge.id}
                data-state={edge.state}
                key={edge.id}
                strokeDasharray={edge.state === "ahead" ? "4 4" : undefined}
                strokeLinejoin="round"
                strokeWidth={EDGE_WIDTH[edge.state]}
              />
            ))}
        </svg>
        {layout.nodes.map((node) => (
          <div
            className={cn(
              "absolute flex flex-col justify-center gap-0.5 overflow-hidden rounded-lg border-2 px-3 py-1.5 text-ink",
              BOX[node.state],
            )}
            data-flow-node={node.id}
            data-state={node.state}
            data-step={node.stepIndex}
            key={node.id}
            style={{
              height: rem(node.h),
              left: rem(node.x),
              top: rem(node.y),
              width: rem(node.w),
            }}
            title={spoken(node, stateLabels)}
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Mark state={node.state} />
              <span className="truncate">{node.title}</span>
            </span>
            {node.who ? <span className="truncate text-xs">{node.who}</span> : null}
            {node.when ? <span className="truncate text-xs text-muted">{node.when}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
};
