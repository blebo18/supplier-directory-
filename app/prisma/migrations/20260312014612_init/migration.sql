-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "fax" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "employees" INTEGER,
    "squareFeet" TEXT,
    "description" TEXT,
    "exhibitor" BOOLEAN NOT NULL DEFAULT false,
    "advertiser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierCategory" (
    "supplierId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "SupplierCategory_pkey" PRIMARY KEY ("supplierId","categoryId")
);

-- CreateTable
CREATE TABLE "SupplierImage" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierVideo" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierDocument" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "senderPhone" TEXT,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Supplier_company_idx" ON "Supplier"("company");

-- CreateIndex
CREATE INDEX "Supplier_state_idx" ON "Supplier"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "SupplierImage_supplierId_idx" ON "SupplierImage"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierVideo_supplierId_idx" ON "SupplierVideo"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierDocument_supplierId_idx" ON "SupplierDocument"("supplierId");

-- CreateIndex
CREATE INDEX "ContactMessage_supplierId_idx" ON "ContactMessage"("supplierId");

-- AddForeignKey
ALTER TABLE "SupplierCategory" ADD CONSTRAINT "SupplierCategory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCategory" ADD CONSTRAINT "SupplierCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierImage" ADD CONSTRAINT "SupplierImage_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierVideo" ADD CONSTRAINT "SupplierVideo_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierDocument" ADD CONSTRAINT "SupplierDocument_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
