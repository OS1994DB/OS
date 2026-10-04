-- CreateTable
CREATE TABLE "PpeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'box',
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PpeMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "change" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "byId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PpeMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "PpeItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PpeMovement_byId_fkey" FOREIGN KEY ("byId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PpeItem_name_key" ON "PpeItem"("name");

-- CreateIndex
CREATE INDEX "PpeMovement_itemId_createdAt_idx" ON "PpeMovement"("itemId", "createdAt");
