import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reward = await prisma.reward.findUnique({
      where: { id: parseInt(params.id) }
    })
    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }
    return NextResponse.json(reward)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reward' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const reward = await prisma.reward.update({
      where: { id: parseInt(params.id) },
      data
    })
    return NextResponse.json(reward)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reward' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reward.delete({
      where: { id: parseInt(params.id) }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete reward' }, { status: 500 })
  }
}
