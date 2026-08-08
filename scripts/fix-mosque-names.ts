const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixMosqueNames() {
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

    for (const mosque of mosques) {
      const newName = mosque.name.replace(/ابن/g, 'بن')
      console.log(`Updating: "${mosque.name}" -> "${newName}"`)
      
      await prisma.mosque.update({
        where: { id: mosque.id },
        data: { name: newName }
      })
    }

    console.log('Successfully updated all mosque names')
  } catch (error) {
    console.error('Error fixing mosque names:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixMosqueNames()
