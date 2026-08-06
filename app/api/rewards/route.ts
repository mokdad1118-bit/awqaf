import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    if (month) where.month = month
    if (year) where.year = parseInt(year)

    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        where,
        orderBy: [
          { year: 'desc' },
          { month: 'asc' }
        ],
        skip,
        take: limit,
      }),
      prisma.reward.count({ where })
    ])

    return NextResponse.json({
      data: rewards,
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
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const reward = await prisma.reward.create({ data })
    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 })
  }
}
