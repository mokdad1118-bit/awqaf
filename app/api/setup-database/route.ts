import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/crypto'

export async function POST(request: Request) {
  try {
    console.log('[SETUP] Starting database setup...')
    
    // Check 1: Test database connection
    console.log('[SETUP] Testing database connection...')
    await prisma.$connect()
    console.log('[SETUP] Database connection successful')

    // Check 2: Create tables using raw SQL
    console.log('[SETUP] Creating tables...')
    
    // Create Mosque table
    await prisma.$executeRawUnsafe(`
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
      )
    `)
    console.log('[SETUP] Mosque table created')

    // Create User table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "permissions" TEXT NOT NULL DEFAULT '',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `)
    console.log('[SETUP] User table created')

    // Create Worker table
    await prisma.$executeRawUnsafe(`
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
      )
    `)
    console.log('[SETUP] Worker table created')

    // Create Reward table
    await prisma.$executeRawUnsafe(`
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
      )
    `)
    console.log('[SETUP] Reward table created')

    // Check 3: Create admin user
    console.log('[SETUP] Creating admin user...')
    const username = 'admin'
    const password = 'admin123456'
    const hashedPassword = hashPassword(password)
    
    const existingAdmin = await prisma.user.findUnique({
      where: { username }
    })

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: 'admin',
          permissions: JSON.stringify(['التنمية الإدارية', 'الحلقات التربوية', 'المحاسبة', 'العاملين']),
        }
      })
      console.log('[SETUP] Admin user created')
    } else {
      console.log('[SETUP] Admin user already exists')
    }

    console.log('[SETUP] Database setup completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      adminCredentials: {
        username,
        password
      }
    })
  } catch (error: any) {
    console.error('[SETUP] Error:', error)
    console.error('[SETUP] Error message:', error.message)
    console.error('[SETUP] Error stack:', error.stack)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
