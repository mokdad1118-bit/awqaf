import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/crypto'

export async function POST(request: Request) {
  try {
    console.log('[LOGIN] Request received')
    
    const body = await request.json()
    console.log('[LOGIN] Username:', body.username)
    
    const { username, password } = body

    console.log('[LOGIN] Checking DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
    console.log('[LOGIN] NODE_ENV:', process.env.NODE_ENV)

    console.log('[LOGIN] Querying database for user...')
    const user = await prisma.user.findUnique({
      where: { username },
    })

    console.log('[LOGIN] User found:', user ? 'YES' : 'NO')

    if (!user) {
      console.log('[LOGIN] User not found')
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    console.log('[LOGIN] Verifying password...')
    const passwordValid = verifyPassword(password, user.password)
    console.log('[LOGIN] Password valid:', passwordValid ? 'YES' : 'NO')

    if (!passwordValid) {
      return NextResponse.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    console.log('[LOGIN] Login successful')
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    })
  } catch (error) {
    console.error('[LOGIN] Error:', error)
    console.error('[LOGIN] Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول', details: String(error) }, { status: 500 })
  }
}
