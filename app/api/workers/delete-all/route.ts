import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    // Delete all workers
    await prisma.worker.deleteMany({})
    
    return NextResponse.json({ message: 'All workers deleted successfully' })
  } catch (error) {
    console.error('Error deleting workers:', error)
    return NextResponse.json({ error: 'Failed to delete workers' }, { status: 500 })
  }
}
