import { afterAll, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";

// Replace the session lookup so each test can choose who is "logged in" (see actAs).
// Better Auth itself is not under test here; the route logic and database are.
vi.mock("@/lib/auth", () => ({ getSessionUser: vi.fn() }));

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Message", "Conversation", "OrderItem", "Order", "Product", "session", "account", "verification", "user" RESTART IDENTITY CASCADE'
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
