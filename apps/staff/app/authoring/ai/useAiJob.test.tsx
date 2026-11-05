// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAiJob } from "./useAiJob";

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  closed = false;
  readonly listeners = new Map<string, ((event: MessageEvent<string>) => void)[]>();
  readonly url: string;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data = "") {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(new MessageEvent(type, { data }));
    }
  }
}

beforeEach(() => {
  FakeEventSource.instances = [];
  vi.stubGlobal("EventSource", FakeEventSource);
});
afterEach(() => vi.unstubAllGlobals());

describe("useAiJob", () => {
  it("is idle with no job and nothing submitted", () => {
    const { result } = renderHook(() => useAiJob(null, false));
    expect(result.current).toEqual({ error: null, resultJson: null, stage: null });
  });

  it("is queued while the job is being submitted", () => {
    const { result } = renderHook(() => useAiJob(null, true));
    expect(result.current.stage).toBe("queued");
  });

  it("is generating until the job's one result arrives, then done with it", () => {
    const { result } = renderHook(() => useAiJob("job-1", false));
    expect(result.current.stage).toBe("generating");
    const source = FakeEventSource.instances[0]!;
    expect(source.url).toBe("/resources/ai-jobs/job-1");

    act(() =>
      source.emit(
        "message",
        JSON.stringify({ error: null, phase: "AI_JOB_PHASE_SUCCEEDED", resultJson: '{"x":1}' }),
      ),
    );
    expect(result.current).toEqual({ error: null, resultJson: '{"x":1}', stage: "done" });
    expect(source.closed).toBe(true);
  });

  it("is failed, with the reason, when the job fails or the stream drops", () => {
    const { result } = renderHook(() => useAiJob("job-1", false));
    act(() => FakeEventSource.instances[0]!.emit("error"));
    expect(result.current.stage).toBe("failed");
  });

  it("starts over for a new job", () => {
    const { rerender, result } = renderHook(({ id }) => useAiJob(id, false), {
      initialProps: { id: "job-1" },
    });
    act(() =>
      FakeEventSource.instances[0]!.emit(
        "message",
        JSON.stringify({ error: "x", phase: "AI_JOB_PHASE_FAILED", resultJson: null }),
      ),
    );
    expect(result.current.stage).toBe("failed");
    rerender({ id: "job-2" });
    expect(result.current.stage).toBe("generating");
  });
});
