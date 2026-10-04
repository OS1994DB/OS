/*
  Warnings:

  - You are about to drop the column `content` on the `CarePlanVersion` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CarePlanReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CarePlanReview_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarePlanReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarePlanVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "identifiedRisk" TEXT NOT NULL DEFAULT '',
    "residentPerspective" TEXT NOT NULL DEFAULT '',
    "careSupport" TEXT NOT NULL DEFAULT '',
    "careDirective" TEXT NOT NULL DEFAULT '',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CarePlanVersion_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarePlanVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarePlanVersion" ("category", "createdAt", "createdById", "id", "residentId", "version") SELECT "category", "createdAt", "createdById", "id", "residentId", "version" FROM "CarePlanVersion";
DROP TABLE "CarePlanVersion";
ALTER TABLE "new_CarePlanVersion" RENAME TO "CarePlanVersion";
CREATE INDEX "CarePlanVersion_residentId_category_idx" ON "CarePlanVersion"("residentId", "category");
CREATE UNIQUE INDEX "CarePlanVersion_residentId_category_version_key" ON "CarePlanVersion"("residentId", "category", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CarePlanReview_residentId_category_idx" ON "CarePlanReview"("residentId", "category");
