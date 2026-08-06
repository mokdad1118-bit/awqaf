import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' }
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, role, permissions } = await request.json()

    const user = await prisma.user.create({
      data: {
        username,
        password,
        role: role || 'user',
        permissions: JSON.stringify(permissions || []),
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
