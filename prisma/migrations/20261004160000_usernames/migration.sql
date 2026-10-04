-- Staff now sign in with a username (backfilled from the old email local part).
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CARER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastMessagesSeenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("active", "createdAt", "email", "id", "lastMessagesSeenAt", "name", "passwordHash", "role", "username") SELECT "active", "createdAt", "email", "id", "lastMessagesSeenAt", "name", "passwordHash", "role", CASE WHEN instr("User"."email", '@') > 0 THEN lower(substr("User"."email", 1, instr("User"."email", '@') - 1)) ELSE lower("User"."email") END || CASE WHEN (SELECT COUNT(*) FROM "User" u2 WHERE (CASE WHEN instr(u2."email", '@') > 0 THEN lower(substr(u2."email", 1, instr(u2."email", '@') - 1)) ELSE lower(u2."email") END) = (CASE WHEN instr("User"."email", '@') > 0 THEN lower(substr("User"."email", 1, instr("User"."email", '@') - 1)) ELSE lower("User"."email") END) AND u2."rowid" < "User"."rowid") > 0 THEN '-' || substr("User"."id", -4) ELSE '' END FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

