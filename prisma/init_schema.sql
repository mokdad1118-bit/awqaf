-- Create tables for Mosque Management System

-- Create Mosque table
CREATE TABLE IF NOT EXISTS "Mosque" (
    "id" SERIAL PRIMARY KEY,
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
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "permissions" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create Worker table
CREATE TABLE IF NOT EXISTS "Worker" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL UNIQUE,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Worker_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Reward table
CREATE TABLE IF NOT EXISTS "Reward" (
    "id" SERIAL PRIMARY KEY,
    "teacherName" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "mosque" TEXT NOT NULL,
    "amountDue" INTEGER NOT NULL DEFAULT 0,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
