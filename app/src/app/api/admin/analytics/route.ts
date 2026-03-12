import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [topViewed, topClicked, totalViews, totalClicks] = await Promise.all([
    prisma.supplierView.groupBy({
      by: ["supplierId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    prisma.webLinkClick.groupBy({
      by: ["supplierId", "url"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    prisma.supplierView.count({
      where: { viewedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.webLinkClick.count({
      where: { clickedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  // Fetch supplier names for top viewed
  const viewedSupplierIds = topViewed.map((v) => v.supplierId);
  const clickedSupplierIds = topClicked.map((c) => c.supplierId);
  const allIds = [...new Set([...viewedSupplierIds, ...clickedSupplierIds])];

  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: allIds } },
    select: { id: true, company: true },
  });
  const supplierMap = new Map(suppliers.map((s) => [s.id, s.company]));

  return NextResponse.json({
    topViewed: topViewed.map((v) => ({
      supplierId: v.supplierId,
      company: supplierMap.get(v.supplierId) || "Unknown",
      views: v._count.id,
    })),
    topClicked: topClicked.map((c) => ({
      supplierId: c.supplierId,
      company: supplierMap.get(c.supplierId) || "Unknown",
      url: c.url,
      clicks: c._count.id,
    })),
    totalViews30d: totalViews,
    totalClicks30d: totalClicks,
  });
}
