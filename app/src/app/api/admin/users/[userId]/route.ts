import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  // Prevent self-demotion
  if (user!.sub === userId) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(updated);
}
