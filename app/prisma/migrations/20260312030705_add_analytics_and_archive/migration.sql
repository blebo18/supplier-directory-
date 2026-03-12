-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SupplierView" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebLinkClick" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebLinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplierView_supplierId_idx" ON "SupplierView"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierView_viewedAt_idx" ON "SupplierView"("viewedAt");

-- CreateIndex
CREATE INDEX "WebLinkClick_supplierId_idx" ON "WebLinkClick"("supplierId");

-- CreateIndex
CREATE INDEX "WebLinkClick_clickedAt_idx" ON "WebLinkClick"("clickedAt");

-- AddForeignKey
ALTER TABLE "SupplierView" ADD CONSTRAINT "SupplierView_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebLinkClick" ADD CONSTRAINT "WebLinkClick_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
