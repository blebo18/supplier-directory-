import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN", "EDITOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, docId } = await params;
  const supplierId = parseInt(id, 10);
  const documentId = parseInt(docId, 10);

  const doc = await prisma.supplierDocument.findFirst({
    where: { id: documentId, supplierId },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteFile(doc.storagePath);
  await prisma.supplierDocument.delete({ where: { id: documentId } });

  return NextResponse.json({ success: true });
}
