import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(params.get("limit") || "6", 10), 20);
  const days = parseInt(params.get("days") || "30", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const viewCounts = await prisma.supplierView.groupBy({
    by: ["supplierId"],
    where: {
      viewedAt: { gte: since },
      supplier: { archived: false },
    },
    _count: { supplierId: true },
    orderBy: { _count: { supplierId: "desc" } },
    take: limit,
  });

  if (viewCounts.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const supplierIds = viewCounts.map((v) => v.supplierId);

  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: supplierIds } },
    include: {
      categories: { include: { category: true } },
    },
  });

  // Sort by view count order
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const items = viewCounts
    .map((v) => supplierMap.get(v.supplierId))
    .filter(Boolean)
    .map((s) => ({
      id: s!.id,
      company: s!.company,
      website: s!.website,
      phone: s!.phone,
      fax: s!.fax,
      street: s!.street,
      city: s!.city,
      state: s!.state,
      zip: s!.zip,
      employees: s!.employees,
      squareFeet: s!.squareFeet,
      description: s!.description,
      categories: s!.categories.map((sc) => sc.category.name).sort(),
    }));

  return NextResponse.json({ items });
}
