import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN", "EDITOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, imageId } = await params;
  const supplierId = parseInt(id, 10);
  const imgId = parseInt(imageId, 10);

  const image = await prisma.supplierImage.findFirst({
    where: { id: imgId, supplierId },
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteFile(image.url);
  await prisma.supplierImage.delete({ where: { id: imgId } });

  return NextResponse.json({ success: true });
}
