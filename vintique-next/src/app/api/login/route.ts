import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { users } from "@/lib/users";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = users.find((u) => u.email === email);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const token = jwt.sign({ email: user.email, name: user.name }, SECRET, { expiresIn: "7d" });
  return NextResponse.json({ token, user: { email: user.email, name: user.name } });
}
