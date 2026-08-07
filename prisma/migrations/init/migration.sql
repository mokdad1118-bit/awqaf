-- CreateTable
CREATE TABLE "Mosque" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mosque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" SERIAL NOT NULL,
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
    "directorate" TEXT,
    "department" TEXT,
    "office" TEXT,
    "location" TEXT,
    "shamCashAccount" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "permissions" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" SERIAL NOT NULL,
    "teacherName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "mosque" TEXT NOT NULL,
    "amountDue" INTEGER NOT NULL DEFAULT 0,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_nationalId_key" ON "Worker"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE CASCADE ON UPDATE CASCADE;
