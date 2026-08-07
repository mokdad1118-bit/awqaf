import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/crypto'

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    console.log('[SEED-ADMIN] Starting admin user seeding...')
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('[SEED-ADMIN] ERROR: DATABASE_URL is not set')
      process.exit(1)
    }
    
    console.log('[SEED-ADMIN] DATABASE_URL is set')
    
    // Test database connection
    await prisma.$connect()
    console.log('[SEED-ADMIN] Database connection successful')
    
    // Check if User table exists
    try {
      await prisma.user.count()
      console.log('[SEED-ADMIN] User table exists')
    } catch (error: any) {
      console.error('[SEED-ADMIN] ERROR: User table does not exist. Please run migrations first.')
      console.error('[SEED-ADMIN] Error:', error.message)
      process.exit(1)
    }
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (existingAdmin) {
      console.log('[SEED-ADMIN] Admin user already exists, skipping creation')
      console.log('[SEED-ADMIN] Admin ID:', existingAdmin.id)
    } else {
      console.log('[SEED-ADMIN] Admin user does not exist, creating...')
      
      const username = 'admin'
      const password = 'admin123456'
      const hashedPassword = hashPassword(password)
      
      const admin = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: 'admin',
          permissions: JSON.stringify(['التنمية الإدارية', 'الحلقات التربوية', 'المحاسبة', 'العاملين']),
        }
      })
      
      console.log('[SEED-ADMIN] Admin user created successfully')
      console.log('[SEED-ADMIN] Admin ID:', admin.id)
      console.log('[SEED-ADMIN] Admin username:', username)
      console.log('[SEED-ADMIN] Admin password:', password)
    }
    
    console.log('[SEED-ADMIN] Admin seeding completed successfully')
  } catch (error: any) {
    console.error('[SEED-ADMIN] ERROR:', error.message)
    console.error('[SEED-ADMIN] Error stack:', error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()
