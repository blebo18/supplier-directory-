import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";
import { parseCSV } from "@/lib/csv-parser";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!requireRole(user, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".csv")) {
    return NextResponse.json({ error: "File must be a CSV" }, { status: 400 });
  }

  const content = await file.text();
  const suppliers = parseCSV(content);

  if (suppliers.length === 0) {
    return NextResponse.json({ error: "No valid suppliers found in CSV" }, { status: 400 });
  }

  // Collect all unique categories from the CSV
  const allCategoryNames = new Set<string>();
  for (const s of suppliers) {
    for (const cat of s.categories) {
      allCategoryNames.add(cat);
    }
  }

  // Upsert categories
  for (const name of allCategoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Build category name -> id map
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  // Track IDs from CSV for archiving
  const csvSupplierIds = new Set(suppliers.map((s) => s.id));

  let created = 0;
  let updated = 0;

  for (const s of suppliers) {
    const existing = await prisma.supplier.findUnique({ where: { id: s.id } });

    const supplierData = {
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
      exhibitor: s.exhibitor,
      advertiser: s.advertiser,
      archived: false,
    };

    if (existing) {
      await prisma.supplier.update({
        where: { id: s.id },
        data: supplierData,
      });
      updated++;
    } else {
      await prisma.supplier.create({
        data: { id: s.id, ...supplierData },
      });
      created++;
    }

    // Update category links: delete existing, create new
    await prisma.supplierCategory.deleteMany({ where: { supplierId: s.id } });
    const catLinks = s.categories
      .map((name) => categoryMap.get(name))
      .filter((id): id is number => id != null)
      .map((categoryId) => ({ supplierId: s.id, categoryId }));

    if (catLinks.length > 0) {
      await prisma.supplierCategory.createMany({
        data: catLinks,
        skipDuplicates: true,
      });
    }
  }

  // Archive suppliers not in the CSV
  const archived = await prisma.supplier.updateMany({
    where: {
      id: { notIn: Array.from(csvSupplierIds) },
      archived: false,
    },
    data: { archived: true },
  });

  return NextResponse.json({
    created,
    updated,
    archived: archived.count,
    categories: allCategoryNames.size,
    total: suppliers.length,
  });
}
