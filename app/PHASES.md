# Supplier Directory — Development Phases

This document tracks the features implemented across each development phase.

---

## Phase 1: Initial Setup & Data Migration

**Goal:** Bootstrap the project and import supplier data from CSV.

- Next.js 16 project with App Router and TypeScript
- PostgreSQL database with Prisma ORM
- Core models: Supplier, Category, SupplierCategory
- CSV migration script (`scripts/migrate-csv.ts`) to bulk import ~10,400 suppliers
- Data cleaning logic: null handling, "DO NOT MAIL" filtering, invalid zip/state normalization
- Category extraction from 10 CSV fields (jsscat1-5, jstcat1-5)

---

## Phase 2: Core UI & Search

**Goal:** Build the public-facing supplier directory.

- Home page with search bar, category sidebar, and paginated supplier grid
- Debounced search by company name (300ms)
- Category filtering via sidebar (desktop) and dropdown (mobile)
- Supplier cards showing company name, location, description preview, and categories
- Supplier detail modal with full info display
- Pagination with smart page number generation
- Responsive layout (mobile-first with Tailwind CSS 4)

---

## Phase 3: Authentication & Authorization

**Goal:** Add user accounts with role-based access control.

- User model with email/password auth (bcrypt hashing)
- JWT-based authentication (jose library)
  - Access tokens (1hr) stored in memory
  - Refresh tokens (7 days) in httpOnly cookies
- Three roles: ADMIN, EDITOR, VIEWER
- First registered user automatically gets ADMIN role
- Auth modal for sign in / sign up
- AuthProvider context for client-side auth state
- Protected API routes with `getUserFromRequest()` + `requireRole()`

---

## Phase 4: Supplier Editing & Media Management

**Goal:** Allow editors to update supplier information and manage media.

- Supplier edit form (EDITOR+ role required)
- Field editing: company info, address, employees, description
- Image management:
  - Upload up to 5 images per supplier (JPEG, PNG, WebP, 5MB max)
  - Image gallery with lightbox viewer (keyboard navigation)
  - Drag-and-drop style upload interface
- Video management:
  - Add video URLs (YouTube embed detection, HTML5 fallback)
  - Video player component
- Document management:
  - PDF upload (10MB max) with download links
  - File storage in `public/uploads/`
- Contact form for sending messages to suppliers

---

## Phase 5: Admin Backend

**Goal:** Build admin tools for user and system management.

- Admin page (`/admin`) with user management table
- Role assignment via dropdown (prevents self-demotion)
- Admin-only access control with redirect for unauthorized users

---

## Phase 6: Analytics, CSV Upload, Category Editing & Archive

**Goal:** Add analytics tracking, CSV re-import capability, category editing, and supplier archiving.

### Database Changes
- Added `archived` field to Supplier model (soft-delete for suppliers missing from CSV imports)
- Added `SupplierView` model for tracking profile views
- Added `WebLinkClick` model for tracking website link clicks
- Indexes on supplierId and timestamp fields for analytics queries

### Analytics Tracking
- `POST /api/suppliers/[id]/view` — records a view when supplier modal opens
- `POST /api/suppliers/[id]/click` — records a click when website link is clicked
- `GET /api/admin/analytics` — aggregated stats (admin-only)
- Analytics dashboard (`/admin/analytics`):
  - 30-day totals for views and clicks
  - Top 20 most viewed suppliers
  - Top 20 most clicked website links

### CSV Upload
- Extracted shared CSV parsing logic into `src/lib/csv-parser.ts`
- `POST /api/admin/csv-upload` — admin-only CSV import endpoint
- Upload page (`/admin/csv-upload`) with file input and results summary
- Upsert logic: updates existing suppliers, creates new ones
- Archive logic: suppliers not in the new CSV are marked `archived = true`
- Unarchive logic: suppliers present in the CSV are set `archived = false`
- Public supplier list automatically filters out archived suppliers
- Admin can view archived suppliers with `?includeArchived=true`

### Category Editing
- Extended `PUT /api/suppliers/[id]` to accept `categories: string[]`
- Categories are upserted (new ones created automatically)
- Supplier edit form now includes category editor:
  - Current categories shown as removable tag chips
  - Text input with autocomplete dropdown (searches existing categories)
  - Add button / Enter key to add new or existing categories

### Admin Navigation
- Admin pages now have consistent navigation links (Users, Analytics, CSV Upload)
- Admin link added to main page header for ADMIN users
- Page title acts as a reset/home link (clears search, filters, pagination)

---

## Current State

All phases are complete. The application is a fully functional supplier directory with:
- ~10,400 suppliers imported from CSV
- Public search and browse interface
- Role-based authentication (Admin/Editor/Viewer)
- Rich media management (images, videos, documents)
- Admin tools (user management, CSV import, analytics)
- Category editing with autocomplete
- Supplier archiving via CSV re-import
- Analytics tracking for views and link clicks
