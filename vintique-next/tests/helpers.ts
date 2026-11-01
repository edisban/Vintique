import { vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const IMAGE = "data:image/png;base64,iVBORw0KGgo=";

export const SHIPPING = { name: "Ada Buyer", address: "1 Main St", city: "Athens", postalCode: "10558", country: "Greece" };

type User = Awaited<ReturnType<typeof createUser>>;

export function createUser(name: string, role: "USER" | "ADMIN" = "USER") {
  return prisma.user.create({ data: { id: `user-${name.toLowerCase()}`, name, email: `${name.toLowerCase()}@test.dev`, role } });
}

/** Make the next API calls run as this user (or as a guest with null). */
export function actAs(user: User | null) {
  vi.mocked(getSessionUser).mockResolvedValue(user as Awaited<ReturnType<typeof getSessionUser>>);
}

export function createListing(seller: User, data: Partial<{ title: string; price: number; category: string; status: string }> = {}) {
  return prisma.product.create({
    data: { title: "Wool coat", price: 50, description: "Warm", image: IMAGE, category: "Women", condition: "Good", sellerId: seller.id, ...data },
  });
}

export function request(method: string, path: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Route context for dynamic routes like /api/products/[id]. */
export const params = (id: number | string) => ({ params: Promise.resolve({ id: String(id) }) });
