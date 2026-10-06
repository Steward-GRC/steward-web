// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";

import { createCollabRooms } from "./collabRoom";

describe("createCollabRooms", () => {
  it("broadcasts to every other member, never back to the sender", () => {
    const rooms = createCollabRooms();
    const a = vi.fn();
    const b = vi.fn();
    const c = vi.fn();
    rooms.enter("draft-1", { id: "a", send: a });
    rooms.enter("draft-1", { id: "b", send: b });
    rooms.enter("draft-1", { id: "c", send: c });

    rooms.broadcast("draft-1", "a", "hello");

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith("hello");
    expect(c).toHaveBeenCalledWith("hello");
  });

  it("broadcastAll sends to every member including the sender", () => {
    const rooms = createCollabRooms();
    const a = vi.fn();
    const b = vi.fn();
    rooms.enter("draft-1", { id: "a", send: a });
    rooms.enter("draft-1", { id: "b", send: b });

    rooms.broadcastAll("draft-1", "presence");

    expect(a).toHaveBeenCalledWith("presence");
    expect(b).toHaveBeenCalledWith("presence");
  });

  it("tracks presence count and drops the room once empty", () => {
    const rooms = createCollabRooms();
    expect(rooms.presenceCount("draft-1")).toBe(0);

    rooms.enter("draft-1", { id: "a", send: vi.fn() });
    rooms.enter("draft-1", { id: "b", send: vi.fn() });
    expect(rooms.presenceCount("draft-1")).toBe(2);

    rooms.leave("draft-1", "a");
    expect(rooms.presenceCount("draft-1")).toBe(1);

    rooms.leave("draft-1", "b");
    expect(rooms.presenceCount("draft-1")).toBe(0);
  });

  it("never errors leaving a room that doesn't exist", () => {
    const rooms = createCollabRooms();
    expect(() => rooms.leave("no-such-room", "a")).not.toThrow();
  });

  it("keeps rooms independent", () => {
    const rooms = createCollabRooms();
    const inRoom1 = vi.fn();
    const inRoom2 = vi.fn();
    rooms.enter("draft-1", { id: "a", send: inRoom1 });
    rooms.enter("draft-2", { id: "a", send: inRoom2 });

    rooms.broadcastAll("draft-1", "only-room-1");

    expect(inRoom1).toHaveBeenCalledWith("only-room-1");
    expect(inRoom2).not.toHaveBeenCalled();
  });
});
