-- CreateTable
CREATE TABLE "Mosque" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "area" REAL,
    "status" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDestroyed" TEXT,
    "state" TEXT NOT NULL,
    "friday" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "imam" TEXT,
    "khatib" TEXT,
    "muezzin" TEXT,
    "khadim" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Worker" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Worker_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_nationalId_key" ON "Worker"("nationalId");
