import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import { saveSiteFile } from "@/lib/storage";

export async function PUT(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const key = formData.get("key") as string;
  const file = formData.get("file") as File | null;
  const value = formData.get("value") as string | null;

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  let finalValue: string;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    finalValue = await saveSiteFile(file.name, buffer);
  } else if (value !== null) {
    finalValue = value;
  } else {
    return NextResponse.json({ error: "File or value is required" }, { status: 400 });
  }

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: finalValue },
    create: { key, value: finalValue },
  });

  return NextResponse.json({ key, value: finalValue });
}
