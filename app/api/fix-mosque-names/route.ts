import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Find all mosques with "ابن" in their name
    const mosques = await prisma.mosque.findMany({
      where: {
        name: {
          contains: 'ابن'
        }
      }
    })

    console.log(`Found ${mosques.length} mosques with 'ابن' in their name`)

    const updated = []
    for (const mosque of mosques) {
      const newName = mosque.name.replace(/ابن/g, 'بن')
      console.log(`Updating: "${mosque.name}" -> "${newName}"`)
      
      await prisma.mosque.update({
        where: { id: mosque.id },
        data: { name: newName }
      })
      
      updated.push({
        id: mosque.id,
        oldName: mosque.name,
        newName
      })
    }

    return NextResponse.json({ 
      message: 'Successfully updated mosque names',
      count: updated.length,
      updated
    })
  } catch (error) {
    console.error('Error fixing mosque names:', error)
    return NextResponse.json({ error: 'Failed to fix mosque names' }, { status: 500 })
  }
}
