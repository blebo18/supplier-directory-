import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clickSchema = z.object({
  url: z.string().min(1).max(2000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supplierId = parseInt(id, 10);

  if (isNaN(supplierId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = clickSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.webLinkClick.create({
    data: { supplierId, url: parsed.data.url },
  });

  return NextResponse.json({ ok: true });
}
