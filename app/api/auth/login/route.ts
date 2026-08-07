import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/crypto'

export async function POST(request: Request) {
  try {
    console.log('[LOGIN] === Login Request Started ===')
    
    const body = await request.json()
    console.log('[LOGIN] Username:', body.username)
    
    const { username, password } = body

    // Check 1: DATABASE_URL exists
    console.log('[LOGIN] Check 1: DATABASE_URL exists:', process.env.DATABASE_URL ? 'YES' : 'NO')
    if (!process.env.DATABASE_URL) {
      console.error('[LOGIN] ERROR: DATABASE_URL is not set in environment')
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 })
    }

    // Check 2: Prisma Client is initialized
    console.log('[LOGIN] Check 2: Prisma Client initialized:', prisma ? 'YES' : 'NO')
    if (!prisma) {
      console.error('[LOGIN] ERROR: Prisma Client is not initialized')
      return NextResponse.json({ error: 'Database client error' }, { status: 500 })
    }

    // Check 3: Test database connection
    console.log('[LOGIN] Check 3: Testing database connection...')
    try {
      await prisma.$connect()
      console.log('[LOGIN] Check 3: Database connection successful')
    } catch (dbError) {
      console.error('[LOGIN] Check 3: Database connection failed:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Check 4: Check if User table exists
    console.log('[LOGIN] Check 4: Checking if User table exists...')
    try {
      const userCount = await prisma.user.count()
      console.log('[LOGIN] Check 4: User table exists, total users:', userCount)
    } catch (tableError: any) {
      console.error('[LOGIN] Check 4: User table does not exist or query failed:', tableError.message)
      console.error('[LOGIN] This likely means migrations have not been run on production database')
      return NextResponse.json({ error: 'Database schema not initialized. Please run migrations.' }, { status: 500 })
    }

    // Check 5: Query for user
    console.log('[LOGIN] Check 5: Querying for user:', username)
    let user
    try {
      user = await prisma.user.findUnique({
        where: { username },
      })
      console.log('[LOGIN] Check 5: User found:', user ? 'YES' : 'NO')
    } catch (queryError: any) {
      console.error('[LOGIN] Check 5: User query failed:', queryError.message)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!user) {
      console.log('[LOGIN] User not found in database')
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    // Check 6: Verify password
    console.log('[LOGIN] Check 6: Verifying password...')
    let passwordValid = false
    try {
      passwordValid = verifyPassword(password, user.password)
      console.log('[LOGIN] Check 6: Password valid:', passwordValid ? 'YES' : 'NO')
    } catch (cryptoError: any) {
      console.error('[LOGIN] Check 6: Password verification failed:', cryptoError.message)
      return NextResponse.json({ error: 'Password verification error' }, { status: 500 })
    }

    if (!passwordValid) {
      console.log('[LOGIN] Invalid password')
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    console.log('[LOGIN] === Login Successful ===')
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    })
  } catch (error: any) {
    console.error('[LOGIN] UNEXPECTED ERROR:', error.message)
    console.error('[LOGIN] Error stack:', error.stack)
    console.error('[LOGIN] Error name:', error.name)
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 })
  } finally {
    // Disconnect prisma connection
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}
