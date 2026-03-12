import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN", "EDITOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, videoId } = await params;
  const supplierId = parseInt(id, 10);
  const vidId = parseInt(videoId, 10);

  const video = await prisma.supplierVideo.findFirst({
    where: { id: vidId, supplierId },
  });

  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.supplierVideo.delete({ where: { id: vidId } });
  return NextResponse.json({ success: true });
}
