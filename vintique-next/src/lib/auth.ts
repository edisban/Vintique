import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  user: {
    // input: false keeps clients from choosing their own role at sign-up
    additionalFields: { role: { type: "string", defaultValue: "USER", input: false } },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: { ...user, role: adminEmail && user.email.toLowerCase() === adminEmail ? "ADMIN" : "USER" },
        }),
      },
    },
  },
});

export async function getSessionUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}
