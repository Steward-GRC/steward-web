// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket } from "ws";

import { attachCollabServer } from "./collabServer";

const listen = (server: Server): Promise<string> =>
  new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address == null || typeof address === "string") throw new Error("no port");
      resolve(`ws://127.0.0.1:${address.port}`);
    });
  });

const close = (server: Server): Promise<void> =>
  new Promise((resolve) => server.close(() => resolve()));

const nextMessage = (ws: WebSocket): Promise<string> =>
  new Promise((resolve) => ws.once("message", (data) => resolve(data.toString())));

const opened = (ws: WebSocket): Promise<void> =>
  new Promise((resolve) => ws.once("open", () => resolve()));

const closed = (ws: WebSocket): Promise<{ code: number }> =>
  new Promise((resolve) => ws.once("close", (code) => resolve({ code })));

let server: Server | undefined;
const sockets: WebSocket[] = [];

afterEach(async () => {
  for (const ws of sockets) ws.close();
  sockets.length = 0;
  if (server) await close(server);
  server = undefined;
});

const connect = async (url: string, draftId: string): Promise<WebSocket> => {
  const ws = new WebSocket(`${url}/collab?draftId=${draftId}`);
  sockets.push(ws);
  await opened(ws);
  return ws;
};

describe("attachCollabServer", () => {
  it("relays a message to the room's other members, never back to the sender", async () => {
    server = createServer();
    attachCollabServer(server);
    const url = await listen(server);

    const a = await connect(url, "draft-1");
    const b = await connect(url, "draft-1");
    a.send(JSON.stringify({ token: "tok-a", type: "join" }));
    b.send(JSON.stringify({ token: "tok-b", type: "join" }));
    await nextMessage(a); // a's own presence announcement
    await nextMessage(b); // the presence announcement after b joins (a sees it too, discarded above)

    const received = nextMessage(b);
    a.send(JSON.stringify({ sectionKey: "purpose", text: "hello", type: "update" }));
    await expect(received).resolves.toBe(
      JSON.stringify({ sectionKey: "purpose", text: "hello", type: "update" }),
    );
  });

  it("announces presence on join and leave", async () => {
    server = createServer();
    attachCollabServer(server);
    const url = await listen(server);

    const a = await connect(url, "draft-2");
    a.send(JSON.stringify({ token: "tok-a", type: "join" }));
    expect(JSON.parse(await nextMessage(a))).toEqual({ count: 1, type: "presence" });

    const b = await connect(url, "draft-2");
    const aSeesSecondJoin = nextMessage(a);
    b.send(JSON.stringify({ token: "tok-b", type: "join" }));
    expect(JSON.parse(await aSeesSecondJoin)).toEqual({ count: 2, type: "presence" });

    const aSeesLeave = nextMessage(a);
    b.close();
    expect(JSON.parse(await aSeesLeave)).toEqual({ count: 1, type: "presence" });
  });

  it("closes a connection that never sends a join frame", async () => {
    server = createServer();
    attachCollabServer(server, "/collab");
    const url = await listen(server);

    const ws = await connect(url, "draft-3");
    ws.send("not json");
    const result = await closed(ws);
    expect(result.code).toBe(4000);
  });

  it("refuses the upgrade outright when draftId is missing", async () => {
    server = createServer();
    attachCollabServer(server);
    const url = await listen(server);

    const ws = new WebSocket(`${url}/collab`);
    sockets.push(ws);
    await expect(
      new Promise((resolve, reject) => {
        ws.once("open", () => resolve("opened"));
        ws.once("error", (error) => reject(error));
      }),
    ).rejects.toBeDefined();
  });

  it("keeps rooms for different drafts independent", async () => {
    server = createServer();
    attachCollabServer(server);
    const url = await listen(server);

    const inDraft1 = await connect(url, "draft-4");
    const inDraft2 = await connect(url, "draft-5");
    inDraft1.send(JSON.stringify({ token: "tok-1", type: "join" }));
    inDraft2.send(JSON.stringify({ token: "tok-2", type: "join" }));
    await nextMessage(inDraft1);
    await nextMessage(inDraft2);

    let draft2SawSomething = false;
    inDraft2.once("message", () => {
      draft2SawSomething = true;
    });
    const b = await connect(url, "draft-4");
    b.send(JSON.stringify({ token: "tok-3", type: "join" }));
    await nextMessage(inDraft1); // draft-1's presence bump from b joining
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(draft2SawSomething).toBe(false);
  });
});
