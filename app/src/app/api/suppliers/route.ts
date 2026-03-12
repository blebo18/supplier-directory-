import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q") || undefined;
  const category = params.get("category") || undefined;
  const page = parseInt(params.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(params.get("pageSize") || "24", 10), 100);

  const includeArchived = params.get("includeArchived") === "true";
  const where: Prisma.SupplierWhereInput = {};

  if (!includeArchived) {
    where.archived = false;
  }

  if (query) {
    where.company = { contains: query, mode: "insensitive" };
  }

  if (category) {
    where.categories = {
      some: { category: { name: { equals: category, mode: "insensitive" } } },
    };
  }

  const [items, total, allCategories] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: {
        categories: { include: { category: true } },
      },
      orderBy: { company: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supplier.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const mappedItems = items.map((s) => ({
    id: s.id,
    company: s.company,
    website: s.website,
    phone: s.phone,
    fax: s.fax,
    street: s.street,
    city: s.city,
    state: s.state,
    zip: s.zip,
    employees: s.employees,
    squareFeet: s.squareFeet,
    description: s.description,
    categories: s.categories.map((sc) => sc.category.name).sort(),
  }));

  return NextResponse.json({
    items: mappedItems,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
    pageSize,
    categories: allCategories.map((c) => c.name),
  });
}
