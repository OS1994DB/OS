-- CreateTable
CREATE TABLE "HousekeepingLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "doneById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HousekeepingLog_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "HousekeepingLog_createdAt_idx" ON "HousekeepingLog"("createdAt");

-- CreateIndex
CREATE INDEX "HousekeepingLog_area_createdAt_idx" ON "HousekeepingLog"("area", "createdAt");
