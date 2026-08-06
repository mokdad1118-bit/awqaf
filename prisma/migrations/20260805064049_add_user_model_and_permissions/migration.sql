-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Worker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "mosqueId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "evaluation" TEXT NOT NULL,
    "quranMem" TEXT NOT NULL,
    "salary" INTEGER NOT NULL DEFAULT 0,
    "salaryUSD" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "kafala" TEXT NOT NULL,
    "notes" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Worker_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Worker" ("createdAt", "education", "evaluation", "id", "kafala", "mosqueId", "name", "nationalId", "notes", "quranMem", "role", "salary", "salaryUSD", "status", "updatedAt") SELECT "createdAt", "education", "evaluation", "id", "kafala", "mosqueId", "name", "nationalId", "notes", "quranMem", "role", "salary", "salaryUSD", "status", "updatedAt" FROM "Worker";
DROP TABLE "Worker";
ALTER TABLE "new_Worker" RENAME TO "Worker";
CREATE UNIQUE INDEX "Worker_nationalId_key" ON "Worker"("nationalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
