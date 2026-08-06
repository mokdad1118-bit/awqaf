import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        include: {
          mosque: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      prisma.worker.count()
    ])

    return NextResponse.json({
      data: workers,
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
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const worker = await prisma.worker.create({ data })
    return NextResponse.json(worker, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 })
  }
}
