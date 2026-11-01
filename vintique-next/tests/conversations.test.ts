import { describe, expect, it } from "vitest";
import { GET as inbox, POST as startConversation } from "@/app/api/conversations/route";
import { GET as unreadCount } from "@/app/api/conversations/unread/route";
import { GET as openThread } from "@/app/api/conversations/[id]/route";
import { POST as sendMessage } from "@/app/api/conversations/[id]/messages/route";
import { actAs, createListing, createUser, params, request } from "./helpers";

async function setup() {
  const seller = await createUser("Sam");
  const buyer = await createUser("Bea");
  const product = await createListing(seller);
  actAs(buyer);
  const { id } = await (await startConversation(request("POST", "/api/conversations", { productId: product.id }))).json();
  return { seller, buyer, product, id: id as number };
}

const send = (id: number, body: string) => sendMessage(request("POST", `/api/conversations/${id}/messages`, { body }), params(id));

describe("starting a conversation", () => {
  it("reopens the same conversation instead of creating a duplicate", async () => {
    const { product, id } = await setup();
    const again = await (await startConversation(request("POST", "/api/conversations", { productId: product.id }))).json();
    expect(again.id).toBe(id);
  });

  it("doesn't let sellers message themselves", async () => {
    const { seller, product } = await setup();
    actAs(seller);
    expect((await startConversation(request("POST", "/api/conversations", { productId: product.id }))).status).toBe(400);
  });
});

describe("messages", () => {
  it("tracks unread messages until the recipient opens the thread", async () => {
    const { seller, id } = await setup();
    expect((await send(id, "Hi! What are the measurements?")).status).toBe(201);

    actAs(seller);
    expect(await (await unreadCount(request("GET", "/"))).json()).toEqual({ count: 1 });
    const [conversation] = await (await inbox(request("GET", "/"))).json();
    expect(conversation).toMatchObject({ unread: 1, lastMessage: { body: "Hi! What are the measurements?" } });

    const thread = await (await openThread(request("GET", "/"), params(id))).json();
    expect(thread.messages).toHaveLength(1);
    expect(await (await unreadCount(request("GET", "/"))).json()).toEqual({ count: 0 });
  });

  it("validates message length", async () => {
    const { id } = await setup();
    expect((await send(id, "   ")).status).toBe(400);
    expect((await send(id, "x".repeat(2001))).status).toBe(400);
  });

  it("hides conversations from anyone who isn't part of them", async () => {
    const { id } = await setup();
    actAs(await createUser("Mallory"));
    expect((await openThread(request("GET", "/"), params(id))).status).toBe(404);
    expect((await send(id, "hello")).status).toBe(404);

    actAs(null);
    expect((await openThread(request("GET", "/"), params(id))).status).toBe(401);
  });
});
