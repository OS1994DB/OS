/*
  Warnings:

  - Added the required column `category` to the `CarePlanVersion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarePlanVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "residentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CarePlanVersion_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarePlanVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarePlanVersion" ("content", "createdAt", "createdById", "id", "residentId", "version") SELECT "content", "createdAt", "createdById", "id", "residentId", "version" FROM "CarePlanVersion";
DROP TABLE "CarePlanVersion";
ALTER TABLE "new_CarePlanVersion" RENAME TO "CarePlanVersion";
CREATE INDEX "CarePlanVersion_residentId_category_idx" ON "CarePlanVersion"("residentId", "category");
CREATE UNIQUE INDEX "CarePlanVersion_residentId_category_version_key" ON "CarePlanVersion"("residentId", "category", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
