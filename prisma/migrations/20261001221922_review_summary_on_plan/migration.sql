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
    "reviewSummary" TEXT NOT NULL DEFAULT '',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CarePlanVersion_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarePlanVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarePlanVersion" ("careDirective", "careSupport", "category", "createdAt", "createdById", "id", "identifiedRisk", "residentId", "residentPerspective", "version") SELECT "careDirective", "careSupport", "category", "createdAt", "createdById", "id", "identifiedRisk", "residentId", "residentPerspective", "version" FROM "CarePlanVersion";
DROP TABLE "CarePlanVersion";
ALTER TABLE "new_CarePlanVersion" RENAME TO "CarePlanVersion";
CREATE INDEX "CarePlanVersion_residentId_category_idx" ON "CarePlanVersion"("residentId", "category");
CREATE UNIQUE INDEX "CarePlanVersion_residentId_category_version_key" ON "CarePlanVersion"("residentId", "category", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
