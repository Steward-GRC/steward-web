// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// A workflow definition's stage editor: reorder with the up/down buttons, name each stage,
// pick its individual approvers and set its quorum. Presentational only: the host route owns
// the save action (a hidden `stagesJson` field mirrors `onChange`'s latest value).
//
// Per-category approver overrides and group-vote units (`approversByCategory`, `groupUnits`)
// have no editor here — this port carries whatever a stage already has for them through
// unchanged, never dropping them, but doesn't let an admin set them from this screen.
import type { WorkflowStageInput } from "@steward-web/api-client";

import { Badge, Button, Checkbox, Field, Input } from "@steward-web/ui";
import { useState } from "react";

import { moveDown, moveUp, newStage } from "./stageOutline";

export interface StageEditorProps {
  initialStages: readonly WorkflowStageInput[];
  /** Fires on every edit with the current stage list. */
  onChange: (stages: readonly WorkflowStageInput[]) => void;
  userOptions: readonly StageEditorUser[];
}

export interface StageEditorUser {
  label: string;
  userId: string;
}

export const StageEditor = ({ initialStages, onChange, userOptions }: StageEditorProps) => {
  const [stages, setStages] = useState<readonly WorkflowStageInput[]>(initialStages);

  const commit = (next: readonly WorkflowStageInput[]) => {
    setStages(next);
    onChange(next);
  };

  const updateStage = (index: number, patch: Partial<WorkflowStageInput>) =>
    commit(stages.map((s, index_) => (index_ === index ? { ...s, ...patch } : s)));

  const toggleApprover = (index: number, userId: string) => {
    const stage = stages[index]!;
    const approvers = stage.approvers.includes(userId)
      ? stage.approvers.filter((id) => id !== userId)
      : [...stage.approvers, userId];
    updateStage(index, { approvers });
  };

  const removeStage = (index: number) => commit(stages.filter((_, index_) => index_ !== index));

  const addStage = () => commit([...stages, newStage(stages)]);

  return (
    <div className="flex flex-col gap-4">
      {stages.map((stage, index) => (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4" key={index}>
          <div className="flex items-center gap-2">
            <Badge className="shrink-0 font-mono" tone="neutral">
              Stage {index + 1}
            </Badge>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => commit(moveUp(stages, index))}
                size="icon"
                type="button"
                variant="ghost"
              >
                ↑
              </Button>
              <Button
                aria-label="Move down"
                disabled={index === stages.length - 1}
                onClick={() => commit(moveDown(stages, index))}
                size="icon"
                type="button"
                variant="ghost"
              >
                ↓
              </Button>
            </div>
            <Input
              aria-label={`Stage ${index + 1} name`}
              className="flex-1"
              onChange={(event) => updateStage(index, { name: event.target.value })}
              placeholder="Stage name"
              value={stage.name}
            />
            <Button
              aria-label="Remove stage"
              disabled={stages.length === 1}
              onClick={() => removeStage(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              ×
            </Button>
          </div>

          <Field hint="one, majority, all, or a specific count." label="Quorum">
            <Input
              className="max-w-40"
              onChange={(event) => updateStage(index, { quorum: event.target.value })}
              value={stage.quorum}
            />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold text-ink">Approvers</legend>
            {userOptions.length === 0 ? (
              <p className="text-xs text-muted">No users available to assign.</p>
            ) : (
              userOptions.map((option) => (
                <label className="flex items-center gap-2 text-sm text-ink" key={option.userId}>
                  <Checkbox
                    checked={stage.approvers.includes(option.userId)}
                    onCheckedChange={() => toggleApprover(index, option.userId)}
                  />
                  {option.label}
                </label>
              ))
            )}
            {stage.approvers.length === 0 ? (
              <p className="text-xs text-warn">
                No approvers yet — this workflow isn&apos;t usable until every stage has one.
              </p>
            ) : null}
          </fieldset>
        </div>
      ))}

      <Button className="self-start" onClick={addStage} size="sm" type="button" variant="secondary">
        Add stage
      </Button>
    </div>
  );
};
