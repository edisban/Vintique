import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { users } from "@/lib/users";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (users.find((u) => u.email === email)) return NextResponse.json({ error: "User exists" }, { status: 409 });
  const hashed = await bcrypt.hash(password, 10);
  users.push({ email, password: hashed, name: name || email });
  const token = jwt.sign({ email, name: name || email }, SECRET, { expiresIn: "7d" });
  return NextResponse.json({ token, user: { email, name: name || email } });
}
