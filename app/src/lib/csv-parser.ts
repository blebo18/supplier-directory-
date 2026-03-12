import { parse } from "csv-parse/sync";

export function clean(val: string | undefined): string | null {
  if (!val || val === "NULL" || val.trim() === "" || /^[\s\-]+$/.test(val))
    return null;
  return val.trim();
}

export interface ParsedSupplier {
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
  exhibitor: boolean;
  advertiser: boolean;
  categories: string[];
}

const catKeys = [
  "jsscat1", "jsscat2", "jsscat3", "jsscat4", "jsscat5",
  "jstcat1", "jstcat2", "jstcat3", "jstcat4", "jstcat5",
];

function isValidCategory(val: string | null): val is string {
  return !!val && val !== "0000" && val !== "Qualify Category" && !val.startsWith(" Qualify");
}

export function parseCSV(content: string): ParsedSupplier[] {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const suppliers: ParsedSupplier[] = [];

  for (const r of records) {
    const id = parseInt(r.id, 10);
    if (isNaN(id)) continue;

    const cats: string[] = [];
    for (const key of catKeys) {
      const val = clean(r[key]);
      if (isValidCategory(val) && !cats.includes(val)) {
        cats.push(val);
      }
    }

    const street = clean(r.street);
    const city = clean(r.city);
    const state = clean(r.state);
    const zip = clean(r.zip);

    suppliers.push({
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
      categories: cats,
    });
  }

  return suppliers;
}
