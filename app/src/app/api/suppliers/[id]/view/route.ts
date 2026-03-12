import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supplierId = parseInt(id, 10);

  if (isNaN(supplierId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.supplierView.create({
    data: { supplierId },
  });

  return NextResponse.json({ ok: true });
}
