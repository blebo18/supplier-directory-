import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const payload = await verifyToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = await signAccessToken(newPayload);
  const newRefreshToken = await signRefreshToken(newPayload);

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });

  response.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
