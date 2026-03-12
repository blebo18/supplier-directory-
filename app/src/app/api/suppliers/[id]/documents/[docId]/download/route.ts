import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;
  const supplierId = parseInt(id, 10);
  const documentId = parseInt(docId, 10);

  const doc = await prisma.supplierDocument.findFirst({
    where: { id: documentId, supplierId },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", doc.storagePath);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.filename}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
