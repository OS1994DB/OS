-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PpeItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PpeMovement";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PppFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PppFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PppFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PppFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BLOB NOT NULL,
    "folderId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PppFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "PppFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PppFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PppFolder_parentId_idx" ON "PppFolder"("parentId");

-- CreateIndex
CREATE INDEX "PppFile_folderId_idx" ON "PppFile"("folderId");

