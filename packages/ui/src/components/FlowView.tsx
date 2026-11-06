// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Check, ChevronDown, CircleDashed, Clock, X } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "#ui/lib/cn";
import { PHONE, useMediaQuery } from "#ui/lib/media";

import {
  type FlowEdgeState,
  flowLayoutOf,
  type FlowMember,
  type FlowNode,
  type FlowNodeState,
  type FlowOrientation,
  type FlowStep,
  NODE_H,
} from "./flowLayout";

export type { FlowMember, FlowNode, FlowNodeState, FlowStep } from "./flowLayout";

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
  active: "flow-active stroke-accent-line motion-reduce:animate-none",
  ahead: "stroke-border-strong opacity-60",
  taken: "stroke-primary",
};
const EDGE_WIDTH: Record<FlowEdgeState, number> = { active: 5, ahead: 2, taken: 3 };
const EDGE_ORDER: Record<FlowEdgeState, number> = { active: 2, ahead: 0, taken: 1 };

/** The arrowhead's fill follows its line. */
const HEAD: Record<FlowEdgeState, string> = {
  active: "fill-accent-line",
  ahead: "fill-border-strong opacity-60",
  taken: "fill-primary",
};
const HEAD_SIZE = 10;

const BOX: Record<FlowNodeState, string> = {
  current:
    "border-accent-line bg-surface shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_35%,transparent)]",
  done: "border-primary bg-primary-soft",
  rejected: "border-danger bg-danger-soft",
  upcoming: "border-dashed border-border-strong bg-surface opacity-60",
};

const FRAME: Record<FlowNodeState, string> = {
  current: "border-accent-line",
  done: "border-primary",
  rejected: "border-danger",
  upcoming: "border-dashed border-border-strong opacity-60",
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
        state === "current" && "text-accent-line",
        state === "upcoming" && "text-muted",
      )}
    />
  );
};

const memberSpoken = (m: FlowMember, stateLabels: FlowViewProps["stateLabels"]): string =>
  `${[m.name, m.when].filter(Boolean).join(", ")}: ${stateLabels[m.state]}`;

/**
 * What a screen reader gets for one box: "Legal team, Review, 2/3: Waiting", then a group's
 * members, each with their own state.
 */
const spoken = (node: FlowNode, stateLabels: FlowViewProps["stateLabels"]): string =>
  `${[node.title, node.description, node.tally, node.who, node.when]
    .filter(Boolean)
    .join(", ")}: ${stateLabels[node.state]}${node.comment ? `. “${node.comment}”` : ""}${
    node.members?.length
      ? `. ${node.members.map((m) => memberSpoken(m, stateLabels)).join("; ")}`
      : ""
  }`;

const Members = ({
  id,
  members,
  stateLabels,
  title,
}: {
  id: string;
  members: readonly FlowMember[];
  stateLabels: FlowViewProps["stateLabels"];
  title: string;
}) => (
  <ul aria-label={title} className="m-0 list-none border-t border-border p-0" id={id}>
    {members.map((m) => (
      <li className="flex h-9 flex-col justify-center px-3" key={m.id}>
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <Mark state={m.state} />
          <span className="truncate">{m.name}</span>
        </span>
        <span className="truncate pl-5 text-xs text-muted">
          {[stateLabels[m.state], m.when].filter(Boolean).join(" · ")}
        </span>
      </li>
    ))}
  </ul>
);

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
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const layout = flowLayoutOf(all, resolved, expanded);
  const heads = useId().replaceAll(":", "");

  return (
    <div className="max-w-full overflow-x-auto overflow-y-hidden pb-1">
      <ol aria-label={label} className="sr-only">
        {all.flatMap((step) => [
          ...step.nodes.map((node) => (
            <li aria-current={node.state === "current" ? "step" : undefined} key={node.id}>
              {spoken(node, stateLabels)}
            </li>
          )),
          ...(layout.frames.some((f) => f.id === `frame:${step.id}`) &&
          (step.tallyLabel ?? step.tally)
            ? [<li key={`frame:${step.id}`}>{step.tallyLabel ?? step.tally}</li>]
            : []),
        ])}
      </ol>
      <div
        className="relative mx-auto"
        data-flow-canvas=""
        data-orientation={resolved}
        style={{ height: rem(layout.height), width: rem(layout.width) }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full fill-none"
          preserveAspectRatio="none"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
        >
          <defs>
            {(Object.keys(HEAD) as FlowEdgeState[]).map((state) => (
              <marker
                id={`${heads}-${state}`}
                key={state}
                markerHeight={HEAD_SIZE}
                markerUnits="userSpaceOnUse"
                markerWidth={HEAD_SIZE}
                orient="auto"
                refX={HEAD_SIZE}
                refY={HEAD_SIZE / 2}
                viewBox={`0 0 ${HEAD_SIZE} ${HEAD_SIZE}`}
              >
                <path className={cn("stroke-none", HEAD[state])} d="M0,0 L10,5 L0,10 z" />
              </marker>
            ))}
          </defs>
          {layout.edges
            .toSorted((a, b) => EDGE_ORDER[a.state] - EDGE_ORDER[b.state])
            .map((edge) => (
              <path
                className={EDGE[edge.state]}
                d={edge.d}
                data-flow-edge={edge.id}
                data-state={edge.state}
                key={edge.id}
                markerEnd={edge.arrow ? `url(#${heads}-${edge.state})` : undefined}
                strokeDasharray={edge.state === "ahead" ? "4 4" : undefined}
                strokeLinejoin="round"
                strokeWidth={EDGE_WIDTH[edge.state]}
              />
            ))}
        </svg>
        {layout.frames.map((frame) => (
          <div
            aria-hidden="true"
            className={cn("absolute rounded-xl border", FRAME[frame.state])}
            data-flow-frame={frame.id}
            data-state={frame.state}
            key={frame.id}
            style={{
              height: rem(frame.h),
              left: rem(frame.x),
              top: rem(frame.y),
              width: rem(frame.w),
            }}
          >
            {frame.tally ? (
              <span className="absolute left-2 top-0.5 text-xs font-semibold text-ink">
                {frame.tally}
              </span>
            ) : null}
          </div>
        ))}
        {layout.nodes.map((node) => {
          const isGroup = node.members !== undefined;
          const open = isGroup && expanded.has(node.id);
          const lines = (
            <>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Mark state={node.state} />
                <span className="truncate">{node.title}</span>
                {node.tally ? (
                  <span className="ml-auto shrink-0 rounded-full bg-sunken px-1.5 text-xs font-semibold">
                    {node.tally}
                  </span>
                ) : null}
                {isGroup ? (
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-180")}
                  />
                ) : null}
              </span>
              {node.description ? (
                <span className="truncate text-xs">{node.description}</span>
              ) : null}
              {node.who ? <span className="truncate text-xs">{node.who}</span> : null}
              {node.when ? <span className="truncate text-xs text-muted">{node.when}</span> : null}
            </>
          );
          return (
            <div
              aria-hidden={isGroup ? undefined : true}
              className={cn(
                "absolute overflow-hidden rounded-lg border-2 text-ink",
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
              {isGroup ? (
                <>
                  <button
                    aria-controls={open ? `${node.id}-members` : undefined}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer flex-col justify-center gap-0.5 px-3 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
                    onClick={() => toggle(node.id)}
                    style={{ height: rem(NODE_H - 4) }}
                    type="button"
                  >
                    {lines}
                  </button>
                  {open ? (
                    <Members
                      id={`${node.id}-members`}
                      members={node.members ?? []}
                      stateLabels={stateLabels}
                      title={node.title}
                    />
                  ) : null}
                </>
              ) : (
                <div className="flex h-full flex-col justify-center gap-0.5 px-3 py-1.5">
                  {lines}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
