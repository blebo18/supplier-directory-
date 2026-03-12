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
  images?: SupplierImage[];
  videos?: SupplierVideo[];
  documents?: SupplierDocument[];
}

export interface SupplierImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface SupplierVideo {
  id: number;
  url: string;
  title: string | null;
}

export interface SupplierDocument {
  id: number;
  filename: string;
  fileSize: number;
}

export interface SearchResult {
  items: Supplier[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
}
