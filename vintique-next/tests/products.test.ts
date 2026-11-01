import { describe, expect, it } from "vitest";
import { GET as listProducts, POST as createProduct } from "@/app/api/products/route";
import { DELETE as deleteProduct, PATCH as updateProduct } from "@/app/api/products/[id]/route";
import { POST as checkout } from "@/app/api/checkout/route";
import { prisma } from "@/lib/prisma";
import { actAs, createListing, createUser, IMAGE, params, request, SHIPPING } from "./helpers";

const valid = { title: "Suede jacket", brand: "Unbranded", size: "M", category: "Men", condition: "Very good", price: 45, description: "70s", image: IMAGE };

describe("creating a listing", () => {
  it("saves it with the signed-in user as seller", async () => {
    const seller = await createUser("Sam");
    actAs(seller);
    const res = await createProduct(request("POST", "/api/products", valid));
    expect(res.status).toBe(201);
    const product = await res.json();
    expect(product).toMatchObject({ title: "Suede jacket", sellerId: seller.id, status: "AVAILABLE" });
  });

  it("requires a signed-in user", async () => {
    actAs(null);
    const res = await createProduct(request("POST", "/api/products", valid));
    expect(res.status).toBe(401);
  });

  it.each([
    ["an unknown category", { category: "Cars" }],
    ["an unknown condition", { condition: "Like new-ish" }],
    ["a zero price", { price: 0 }],
    ["a price above the maximum", { price: 1_000_000 }],
    ["a title that is too long", { title: "x".repeat(81) }],
    ["a description that is too long", { description: "x".repeat(2001) }],
    ["a file that is not an image", { image: "data:text/plain;base64,aGk=" }],
    ["a missing title", { title: "  " }],
  ])("rejects %s", async (_, override) => {
    actAs(await createUser("Sam"));
    const res = await createProduct(request("POST", "/api/products", { ...valid, ...override }));
    expect(res.status).toBe(400);
  });
});

describe("browsing listings", () => {
  it("shows only available items and supports category, search and pagination", async () => {
    const seller = await createUser("Sam");
    await createListing(seller, { title: "Silk scarf", category: "Accessories" });
    await createListing(seller, { title: "Denim jacket", category: "Men" });
    await createListing(seller, { title: "Sold boots", category: "Shoes", status: "SOLD" });
    actAs(null);

    const all = await (await listProducts(request("GET", "/api/products"))).json();
    expect(all.total).toBe(2);
    expect(all.items.map((p: { title: string }) => p.title)).not.toContain("Sold boots");

    const men = await (await listProducts(request("GET", "/api/products?category=Men"))).json();
    expect(men.items.map((p: { title: string }) => p.title)).toEqual(["Denim jacket"]);

    const search = await (await listProducts(request("GET", "/api/products?q=SILK"))).json();
    expect(search.items.map((p: { title: string }) => p.title)).toEqual(["Silk scarf"]);

    const page2 = await (await listProducts(request("GET", "/api/products?limit=1&page=2"))).json();
    expect(page2).toMatchObject({ total: 2, page: 2, limit: 1 });
    expect(page2.items).toHaveLength(1);
  });

  it("lists a seller's own items, including sold ones, only when signed in", async () => {
    const seller = await createUser("Sam");
    await createListing(seller);
    await createListing(seller, { status: "SOLD" });

    actAs(null);
    expect((await listProducts(request("GET", "/api/products?mine=1"))).status).toBe(401);

    actAs(seller);
    const mine = await (await listProducts(request("GET", "/api/products?mine=1"))).json();
    expect(mine.total).toBe(2);
  });
});

describe("managing a listing", () => {
  it("lets the seller mark it sold and delete it", async () => {
    const seller = await createUser("Sam");
    const product = await createListing(seller);
    actAs(seller);

    const res = await updateProduct(request("PATCH", `/api/products/${product.id}`, { status: "SOLD" }), params(product.id));
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("SOLD");

    expect((await deleteProduct(request("DELETE", `/api/products/${product.id}`), params(product.id))).status).toBe(204);
    expect(await prisma.product.count()).toBe(0);
  });

  it("forbids other members, but allows admins", async () => {
    const seller = await createUser("Sam");
    const product = await createListing(seller);

    actAs(await createUser("Mallory"));
    expect((await updateProduct(request("PATCH", "/", { status: "SOLD" }), params(product.id))).status).toBe(403);
    expect((await deleteProduct(request("DELETE", "/"), params(product.id))).status).toBe(403);

    actAs(null);
    expect((await deleteProduct(request("DELETE", "/"), params(product.id))).status).toBe(401);

    actAs(await createUser("Admin", "ADMIN"));
    expect((await deleteProduct(request("DELETE", "/"), params(product.id))).status).toBe(204);
  });

  it("protects items that are part of an order", async () => {
    const seller = await createUser("Sam");
    const product = await createListing(seller);
    actAs(await createUser("Bea"));
    expect((await checkout(request("POST", "/api/checkout", { productIds: [product.id], shipping: SHIPPING }))).status).toBe(201);

    actAs(seller);
    expect((await updateProduct(request("PATCH", "/", { status: "AVAILABLE" }), params(product.id))).status).toBe(409);
    expect((await deleteProduct(request("DELETE", "/"), params(product.id))).status).toBe(409);
  });
});
