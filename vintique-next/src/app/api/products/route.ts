import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { title, price, description, image } = await req.json();
  if (!title || !price || !description || !image) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: { title, price: parseFloat(price), description, image },
  });
  return NextResponse.json(product);
}
