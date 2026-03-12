import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

export interface Supplier {
  id: number;
  company: string;
  website: string | null;
  phone: string | null;
  fax: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  employees: number | null;
  squareFeet: string | null;
  description: string | null;
  categories: string[];
}

let cachedSuppliers: Supplier[] | null = null;
let cachedCategories: string[] | null = null;

function clean(val: string | undefined): string | null {
  if (!val || val === "NULL" || val.trim() === "" || /^[\s\-]+$/.test(val)) return null;
  return val.trim();
}

function loadData() {
  if (cachedSuppliers) return;

  const csvPath = path.join(process.cwd(), "..", "suppliers.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const categorySet = new Set<string>();

  cachedSuppliers = (records as Record<string, string>[]).map((r) => {
    const cats = new Set<string>();
    for (const key of ["jsscat1", "jsscat2", "jsscat3", "jsscat4", "jsscat5", "jstcat1", "jstcat2", "jstcat3", "jstcat4", "jstcat5"]) {
      const val = clean(r[key]);
      if (val && val !== "0000" && val !== "Qualify Category" && !val.startsWith(" Qualify")) {
        cats.add(val);
      }
    }
    cats.forEach((c) => categorySet.add(c));

    return {
      id: parseInt(r.id, 10),
      company: r.company?.trim() || "Unknown",
      website: clean(r.website),
      phone: clean(r.phone),
      fax: clean(r.fax),
      street: clean(r.street) === "DO NOT MAIL" ? null : clean(r.street),
      city: clean(r.city) === "DO NOT MAIL" ? null : clean(r.city),
      state: clean(r.state) === "XX" ? null : clean(r.state),
      zip: clean(r.zip) === "00000" || clean(r.zip) === "99999" ? null : clean(r.zip),
      employees: r.employees && r.employees !== "0" ? parseInt(r.employees.replace(/,/g, ""), 10) || null : null,
      squareFeet: clean(r.square_feet) && r.square_feet !== "0" ? r.square_feet.trim() : null,
      description: clean(r.description),
      categories: Array.from(cats).sort(),
    } as Supplier;
  });

  cachedCategories = Array.from(categorySet).sort();
}

export function getSuppliers(): Supplier[] {
  loadData();
  return cachedSuppliers!;
}

export function getCategories(): string[] {
  loadData();
  return cachedCategories!;
}

export interface SearchParams {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export function searchSuppliers(params: SearchParams) {
  const { query, category, page = 1, pageSize = 24 } = params;
  let results = getSuppliers();

  if (query) {
    const q = query.toLowerCase();
    results = results.filter((s) => s.company.toLowerCase().includes(q));
  }

  if (category) {
    const cat = category.toLowerCase();
    results = results.filter((s) =>
      s.categories.some((c) => c.toLowerCase() === cat)
    );
  }

  const total = results.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return { items, total, page, totalPages, pageSize };
}
