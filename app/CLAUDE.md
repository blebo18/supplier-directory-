# CLAUDE.md — Supplier Directory

## Project Overview

Full-stack supplier directory application built with Next.js 16 (App Router), PostgreSQL via Prisma ORM, and Tailwind CSS 4. Allows searching, filtering, and managing manufacturing suppliers with role-based access control.

## Quick Reference

### Commands
- `npm run dev` — Start development server (port 3000)
- `npm run build` — Production build (run after changes to verify)
- `npm run lint` — ESLint
- `npx prisma migrate dev --name <name>` — Create and apply a migration
- `npx prisma studio` — Database GUI
- `npx tsx scripts/migrate-csv.ts` — Import suppliers from `suppliers.csv`
- `npx tsx scripts/create-admin.ts` — Create/reset admin user

### Environment
- `.env` contains `DATABASE_URL` (PostgreSQL) and `JWT_SECRET`
- Working directory for all commands: `/Users/blebo/repos/supplier-directory/app/`
- CSV source file is one level up: `../suppliers.csv`

## Architecture

### Stack
- **Framework:** Next.js 16.1.6, React 19, TypeScript 5
- **Database:** PostgreSQL with Prisma 5.22
- **Auth:** JWT (jose) with bcrypt, httpOnly refresh cookies
- **Validation:** Zod
- **Styling:** Tailwind CSS 4
- **CSV:** csv-parse

### Directory Structure
```
app/
  src/
    app/                  # Next.js App Router pages & API routes
      page.tsx            # Home — search, filter, paginate suppliers
      admin/              # Admin pages (users, analytics, csv-upload)
      api/
        auth/             # login, register, me, refresh
        suppliers/        # CRUD, media, contact, analytics tracking
        admin/            # users, analytics, csv-upload
    components/
      auth/               # AuthModal, AuthProvider (context)
      suppliers/          # SupplierCard, Grid, Modal, EditForm, Search, Pagination, CategorySidebar
      contact/            # ContactForm
      media/              # ImageGallery, ImageUploader, Lightbox, VideoPlayer, VideoManager, DocumentList, DocumentUploader
    lib/
      auth.ts             # JWT sign/verify, password hashing, getUserFromRequest, requireRole
      prisma.ts           # Singleton Prisma client
      storage.ts          # File storage to public/uploads/
      csv-parser.ts       # Shared CSV parsing logic (used by migrate script and upload API)
      types.ts            # Shared TypeScript interfaces
  prisma/
    schema.prisma         # Database schema
    migrations/           # Migration history
  scripts/
    migrate-csv.ts        # Bulk CSV import script
    create-admin.ts       # Admin user creation
```

### Database Models
- **User** — email/password auth with roles (ADMIN, EDITOR, VIEWER)
- **Supplier** — core entity with company info, address, `archived` flag
- **Category** / **SupplierCategory** — many-to-many categories
- **SupplierImage** — up to 5 images per supplier
- **SupplierVideo** — video URLs (YouTube or direct)
- **SupplierDocument** — PDF uploads
- **SupplierView** — analytics: tracks modal opens
- **WebLinkClick** — analytics: tracks website link clicks
- **ContactMessage** — visitor messages to suppliers

### Auth & Roles
- **ADMIN** — full access: user management, CSV upload, analytics, editing
- **EDITOR** — can edit suppliers and manage media
- **VIEWER** — read-only (default for new registrations)
- First registered user automatically gets ADMIN role
- Access token: 1hr, refresh token: 7 days (httpOnly cookie)

### Key Patterns
- API routes use `getUserFromRequest()` + `requireRole()` for auth
- Prisma client is a singleton via `src/lib/prisma.ts`
- All API validation uses Zod schemas
- Supplier IDs are integers from the CSV (not auto-incremented)
- The `archived` field hides suppliers from public view; admin can see all with `?includeArchived=true`
- CSV upload upserts suppliers and archives any not present in the new file
- Media files stored in `public/uploads/{images,videos,documents}/{supplierId}/`

### API Routes Summary
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Public | Register |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/auth/refresh` | Cookie | Refresh token |
| GET | `/api/suppliers` | Public | Search/paginate suppliers |
| GET | `/api/suppliers/[id]` | Public | Supplier detail with media |
| PUT | `/api/suppliers/[id]` | Editor+ | Update supplier (incl. categories) |
| POST | `/api/suppliers/[id]/contact` | Public | Send contact message |
| POST | `/api/suppliers/[id]/view` | Public | Track supplier view |
| POST | `/api/suppliers/[id]/click` | Public | Track website link click |
| POST/DELETE | `/api/suppliers/[id]/images` | Editor+ | Manage images |
| POST/DELETE | `/api/suppliers/[id]/videos` | Editor+ | Manage videos |
| POST/DELETE/GET | `/api/suppliers/[id]/documents` | Editor+ | Manage documents |
| GET | `/api/admin/users` | Admin | List users |
| PUT | `/api/admin/users/[userId]` | Admin | Update user role |
| GET | `/api/admin/analytics` | Admin | View analytics |
| POST | `/api/admin/csv-upload` | Admin | Upload CSV to upsert suppliers |
