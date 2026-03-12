import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signAccessToken, signRefreshToken } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
