import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function clean(val: string | undefined): string | null {
  if (!val || val === "NULL" || val.trim() === "" || /^[\s\-]+$/.test(val))
    return null;
  return val.trim();
}

async function main() {
  console.log("Reading CSV...");
  const csvPath = path.join(__dirname, "..", "..", "suppliers.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  console.log(`Parsed ${records.length} records from CSV`);

  // Extract all unique categories
  const categorySet = new Set<string>();
  const catKeys = [
    "jsscat1", "jsscat2", "jsscat3", "jsscat4", "jsscat5",
    "jstcat1", "jstcat2", "jstcat3", "jstcat4", "jstcat5",
  ];

  for (const r of records) {
    for (const key of catKeys) {
      const val = clean(r[key]);
      if (val && val !== "0000" && val !== "Qualify Category" && !val.startsWith(" Qualify")) {
        categorySet.add(val);
      }
    }
  }

  const categoryNames = Array.from(categorySet).sort();
  console.log(`Found ${categoryNames.length} unique categories`);

  // Insert categories
  console.log("Inserting categories...");
  await prisma.category.createMany({
    data: categoryNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  // Build category name -> id map
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

  // Insert suppliers in batches
  const BATCH_SIZE = 500;
  let supplierCount = 0;
  let linkCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    for (const r of batch) {
      const id = parseInt(r.id, 10);
      if (isNaN(id)) continue;

      // Collect categories for this supplier
      const cats = new Set<string>();
      for (const key of catKeys) {
        const val = clean(r[key]);
        if (val && val !== "0000" && val !== "Qualify Category" && !val.startsWith(" Qualify")) {
          cats.add(val);
        }
      }

      const street = clean(r.street);
      const city = clean(r.city);
      const state = clean(r.state);
      const zip = clean(r.zip);

      await prisma.supplier.upsert({
        where: { id },
        update: {},
        create: {
          id,
          company: r.company?.trim() || "Unknown",
          website: clean(r.website),
          phone: clean(r.phone),
          fax: clean(r.fax),
          street: street === "DO NOT MAIL" ? null : street,
          city: city === "DO NOT MAIL" ? null : city,
          state: state === "XX" ? null : state,
          zip: zip === "00000" || zip === "99999" ? null : zip,
          employees:
            r.employees && r.employees !== "0"
              ? parseInt(r.employees.replace(/,/g, ""), 10) || null
              : null,
          squareFeet:
            clean(r.square_feet) && r.square_feet !== "0"
              ? r.square_feet.trim()
              : null,
          description: clean(r.description),
          exhibitor: r.exhibitor === "1",
          advertiser: r.advertiser === "1",
          categories: {
            createMany: {
              data: Array.from(cats)
                .map((name) => ({ categoryId: categoryMap.get(name)! }))
                .filter((d) => d.categoryId != null),
              skipDuplicates: true,
            },
          },
        },
      });
      supplierCount++;
      linkCount += cats.size;
    }

    console.log(
      `  Processed ${Math.min(i + BATCH_SIZE, records.length)}/${records.length} records...`
    );
  }

  console.log(`\nMigration complete:`);
  console.log(`  Suppliers: ${supplierCount}`);
  console.log(`  Categories: ${categoryNames.length}`);
  console.log(`  Category links: ${linkCount}`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
