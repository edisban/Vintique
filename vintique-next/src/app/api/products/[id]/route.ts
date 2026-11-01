import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

const seller = { select: { id: true, name: true, createdAt: true } } as const;

// The seller can manage their own listing; admins can manage any listing.
async function authorize(req: Request, params: Ctx["params"]) {
  const id = parseInt((await params).id);
  if (!id) return { error: NextResponse.json({ error: "Invalid id" }, { status: 400 }) };
  const [user, product] = await Promise.all([getSessionUser(req), prisma.product.findUnique({ where: { id } })]);
  if (!user) return { error: NextResponse.json({ error: "Login required" }, { status: 401 }) };
  if (!product) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (product.sellerId !== user.id && user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "You can only manage your own listings" }, { status: 403 }) };
  }
  // Items bought through checkout belong to an order: they can't be relisted or deleted.
  if (await prisma.orderItem.count({ where: { productId: id } })) {
    return { error: NextResponse.json({ error: "This piece was bought through Vintique and is part of an order" }, { status: 409 }) };
  }
  return { id };
}

export async function GET(_req: Request, { params }: Ctx) {
  const id = parseInt((await params).id);
  const product = id ? await prisma.product.findUnique({ where: { id }, include: { seller } }) : null;
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await authorize(req, params);
  if (auth.error) return auth.error;
  const body = await req.json().catch(() => null);
  if (body?.status !== "AVAILABLE" && body?.status !== "SOLD") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const product = await prisma.product.update({ where: { id: auth.id }, data: { status: body.status }, include: { seller } });
  return NextResponse.json(product);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const auth = await authorize(req, params);
  if (auth.error) return auth.error;
  await prisma.product.delete({ where: { id: auth.id } });
  return new NextResponse(null, { status: 204 });
}
