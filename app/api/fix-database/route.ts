import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    console.log('[FIX-DATABASE] Starting database fix...')
    
    // Test database connection
    await prisma.$connect()
    console.log('[FIX-DATABASE] Database connection successful')

    // Add new columns to Worker table
    console.log('[FIX-DATABASE] Adding new columns to Worker table...')
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Worker" 
      ADD COLUMN IF NOT EXISTS "directorate" TEXT,
      ADD COLUMN IF NOT EXISTS "department" TEXT,
      ADD COLUMN IF NOT EXISTS "office" TEXT,
      ADD COLUMN IF NOT EXISTS "location" TEXT,
      ADD COLUMN IF NOT EXISTS "shamCashAccount" TEXT
    `)
    
    console.log('[FIX-DATABASE] Columns added successfully')

    // Verify columns were added
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Worker' 
      AND column_name IN ('directorate', 'department', 'office', 'location', 'shamCashAccount')
    `
    
    console.log('[FIX-DATABASE] Verification result:', result)

    console.log('[FIX-DATABASE] Database fix completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Database fix completed successfully',
      columnsAdded: result
    })
  } catch (error: any) {
    console.error('[FIX-DATABASE] Error:', error)
    console.error('[FIX-DATABASE] Error message:', error.message)
    console.error('[FIX-DATABASE] Error stack:', error.stack)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
