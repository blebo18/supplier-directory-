import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import { saveFile } from "@/lib/storage";

const MAX_IMAGES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  const currentCount = await prisma.supplierImage.count({ where: { supplierId } });
  if (currentCount >= MAX_IMAGES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES} images allowed` },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size must be under 5MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveFile("images", supplierId, file.name, buffer);

  const altText = (formData.get("altText") as string) || null;

  const image = await prisma.supplierImage.create({
    data: {
      supplierId,
      url,
      altText,
      sortOrder: currentCount,
    },
  });

  return NextResponse.json({
    id: image.id,
    url: image.url,
    altText: image.altText,
    sortOrder: image.sortOrder,
  });
}
