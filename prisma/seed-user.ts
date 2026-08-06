import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding admin user...')

  // Create admin user with all permissions
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      permissions: JSON.stringify(['التنمية الإدارية', 'الحلقات التربوية', 'المحاسبة', 'العاملين']),
    },
    create: {
      username: 'admin',
      password: '123456789', // In production, this should be hashed
      role: 'admin',
      permissions: JSON.stringify(['التنمية الإدارية', 'الحلقات التربوية', 'المحاسبة', 'العاملين']),
    },
  })

  console.log('Admin user created:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
