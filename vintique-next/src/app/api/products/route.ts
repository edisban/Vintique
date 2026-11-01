import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { CATEGORIES, CONDITIONS } from "@/lib/catalog";

const MAX_IMAGE_LENGTH = 3_000_000; // ~2 MB file as a base64 data URL

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
};

const sellerSelect = { select: { id: true, name: true, createdAt: true } } as const;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(params.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "12") || 12));
  const q = params.get("q")?.trim();
  const category = params.get("category");

  // ?mine=1 lists the signed-in seller's own items, sold ones included
  let where: Prisma.ProductWhereInput;
  if (params.get("mine") === "1") {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
    where = { sellerId: user.id };
  } else {
    where = { status: "AVAILABLE" };
    if (category && (CATEGORIES as readonly string[]).includes(category)) where.category = category;
    if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }];
  }

  const orderBy = SORTS[params.get("sort") || ""] ?? SORTS.newest;
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { seller: sellerSelect } }),
    prisma.product.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const title = str(body?.title);
  const brand = str(body?.brand);
  const description = str(body?.description);
  const size = str(body?.size).slice(0, 20);
  const category = str(body?.category);
  const condition = str(body?.condition);
  const image = typeof body?.image === "string" ? body.image : "";
  const price = Number(body?.price);
  if (!title || !description || !image || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  if (!(CATEGORIES as readonly string[]).includes(category) || !(CONDITIONS as readonly string[]).includes(condition)) {
    return NextResponse.json({ error: "Please choose a category and condition" }, { status: 400 });
  }
  if (!image.startsWith("data:image/") || image.length > MAX_IMAGE_LENGTH) {
    return NextResponse.json({ error: "Image must be an image file under 2 MB" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: { title, brand, description, size, category, condition, price, image, sellerId: user.id },
    include: { seller: sellerSelect },
  });
  return NextResponse.json(product, { status: 201 });
}
