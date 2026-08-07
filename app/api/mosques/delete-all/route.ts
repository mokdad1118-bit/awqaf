import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    // Delete all mosques (cascade will delete workers)
    await prisma.mosque.deleteMany({})
    
    return NextResponse.json({ message: 'All mosques deleted successfully' })
  } catch (error) {
    console.error('Error deleting mosques:', error)
    return NextResponse.json({ error: 'Failed to delete mosques' }, { status: 500 })
  }
}
