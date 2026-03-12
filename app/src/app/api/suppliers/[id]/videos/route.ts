import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  url: z.string().url().max(500),
  title: z.string().max(255).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN", "EDITOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supplierId = parseInt(id, 10);
  if (isNaN(supplierId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const video = await prisma.supplierVideo.create({
    data: {
      supplierId,
      url: parsed.data.url,
      title: parsed.data.title || null,
    },
  });

  return NextResponse.json({
    id: video.id,
    url: video.url,
    title: video.title,
  });
}
