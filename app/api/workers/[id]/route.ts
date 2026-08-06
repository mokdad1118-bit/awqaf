import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: parseInt(params.id) },
      include: { mosque: true }
    })
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }
    return NextResponse.json(worker)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch worker' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const worker = await prisma.worker.update({
      where: { id: parseInt(params.id) },
      data
    })
    return NextResponse.json(worker)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update worker' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.worker.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ message: 'Worker deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete worker' }, { status: 500 })
  }
}
