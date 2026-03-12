# Supplier Directory

A full-stack web application for searching, browsing, and managing manufacturing suppliers. Built with Next.js 16, PostgreSQL, and Tailwind CSS.

## Features

- **Search & Filter** — Search suppliers by company name, filter by category, paginated results
- **Supplier Profiles** — Detailed modal view with company info, images, videos, documents, and contact form
- **Role-Based Access** — Three-tier permission system (Admin, Editor, Viewer)
- **Media Management** — Upload images (up to 5), embed videos, attach PDF documents
- **Category System** — Many-to-many category tagging with autocomplete editing
- **Admin Dashboard**
  - User management with role assignment
  - CSV import/export with upsert and archiving logic
  - Analytics dashboard (top viewed suppliers, most clicked links, 30-day totals)
- **Contact Form** — Visitors can send messages to suppliers
- **Analytics Tracking** — Automatic tracking of supplier profile views and website link clicks

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| Frontend | React 19, TypeScript 5, Tailwind CSS 4 |
| Database | PostgreSQL with Prisma 5.22 ORM |
| Auth | JWT (jose), bcrypt password hashing |
| Validation | Zod |
| CSV Parsing | csv-parse |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   ```
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/supplier_directory"
   JWT_SECRET="your-secret-key"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Import supplier data** (optional)
   ```bash
   # Place suppliers.csv in the repo root (one level above app/)
   npx tsx scripts/migrate-csv.ts
   ```

5. **Create an admin user** (optional)
   ```bash
   npx tsx scripts/create-admin.ts
   ```
   Or register the first user through the UI — they automatically get the ADMIN role.

6. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── src/
│   ├── app/                    # Pages & API routes
│   │   ├── page.tsx            # Home page (search, filter, browse)
│   │   ├── admin/              # Admin pages
│   │   │   ├── page.tsx        # User management
│   │   │   ├── analytics/      # Analytics dashboard
│   │   │   └── csv-upload/     # CSV import
│   │   └── api/
│   │       ├── auth/           # Authentication endpoints
│   │       ├── suppliers/      # Supplier CRUD & media
│   │       └── admin/          # Admin-only endpoints
│   ├── components/
│   │   ├── auth/               # Auth modal & context provider
│   │   ├── suppliers/          # Supplier UI components
│   │   ├── contact/            # Contact form
│   │   └── media/              # Image, video, document components
│   └── lib/                    # Shared utilities
│       ├── auth.ts             # JWT & password utilities
│       ├── prisma.ts           # Database client
│       ├── storage.ts          # File storage
│       ├── csv-parser.ts       # CSV parsing logic
│       └── types.ts            # TypeScript interfaces
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── scripts/                    # CLI utilities
└── public/uploads/             # Uploaded media files
```

## Database Schema

The application uses 10 database models:

- **User** — Authentication with role-based access (ADMIN / EDITOR / VIEWER)
- **Supplier** — Core supplier data with an `archived` flag for soft-delete
- **Category** / **SupplierCategory** — Many-to-many category system
- **SupplierImage** — Image gallery (max 5 per supplier)
- **SupplierVideo** — Video embeds (YouTube or direct URL)
- **SupplierDocument** — PDF attachments
- **SupplierView** — Tracks when a supplier profile is viewed
- **WebLinkClick** — Tracks when a supplier's website link is clicked
- **ContactMessage** — Messages sent to suppliers via the contact form

## User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Everything: user management, CSV upload, analytics, editing |
| **Editor** | Edit supplier info, manage images/videos/documents |
| **Viewer** | Browse and search (default for new users) |

## CSV Import

The admin CSV upload (`/admin/csv-upload`) supports:
- **Upsert** — existing suppliers are updated, new ones are created
- **Archiving** — suppliers not present in the uploaded CSV are archived (hidden from public view)
- **Categories** — category links are rebuilt from CSV fields (`jsscat1`-`5`, `jstcat1`-`5`)
- Data cleaning: strips nulls, "DO NOT MAIL" addresses, invalid zips/states

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/migrate-csv.ts` | Bulk import from `suppliers.csv` |
| `scripts/create-admin.ts` | Create or reset admin user |

## Building for Production

```bash
npm run build
npm start
```
