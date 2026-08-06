import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [mosques, total] = await Promise.all([
      prisma.mosque.findMany({
        include: {
          workers: {
            select: {
              id: true,
              name: true,
              role: true,
            }
          },
          _count: {
            select: { workers: true }
          }
        },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      prisma.mosque.count()
    ])

    return NextResponse.json({
      data: mosques,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mosques' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const mosque = await prisma.mosque.create({ data })
    return NextResponse.json(mosque, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create mosque' }, { status: 500 })
  }
}
