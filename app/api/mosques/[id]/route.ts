import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mosque = await prisma.mosque.findUnique({
      where: { id: parseInt(params.id) },
      include: { workers: true }
    })
    if (!mosque) {
      return NextResponse.json({ error: 'Mosque not found' }, { status: 404 })
    }
    return NextResponse.json(mosque)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mosque' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const mosque = await prisma.mosque.update({
      where: { id: parseInt(params.id) },
      data
    })
    return NextResponse.json(mosque)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update mosque' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.mosque.delete({ where: { id: parseInt(params.id) } })
    return NextResponse.json({ message: 'Mosque deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete mosque' }, { status: 500 })
  }
}
