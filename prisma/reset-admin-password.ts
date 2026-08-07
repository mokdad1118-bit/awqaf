import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/crypto'

const prisma = new PrismaClient()

async function resetAdminPassword() {
  const username = 'admin'
  const newPassword = process.argv[2] || 'admin123456'

  console.log('🔐 Resetting admin password...')
  console.log(`Username: ${username}`)
  console.log(`New password: ${newPassword}`)

  try {
    // Hash the password
    const hashedPassword = hashPassword(newPassword)
    console.log('✅ Password hashed successfully')

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username }
    })

    if (!existingAdmin) {
      console.log('❌ Admin user not found. Creating new admin user...')
      
      // Create new admin user with all permissions
      const newAdmin = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: 'admin',
          permissions: JSON.stringify(['التنمية الإدارية', 'الحلقات التربوية', 'المحاسبة', 'العاملين']),
        }
      })

      console.log('✅ Admin user created successfully!')
      console.log(`User ID: ${newAdmin.id}`)
      console.log(`Username: ${newAdmin.username}`)
      console.log(`Role: ${newAdmin.role}`)
      console.log(`Permissions: ${JSON.parse(newAdmin.permissions).join(', ')}`)
    } else {
      console.log('✅ Admin user found. Updating password...')
      
      // Update existing admin password
      const updatedAdmin = await prisma.user.update({
        where: { username },
        data: {
          password: hashedPassword,
          permissions: JSON.stringify(['التنمية الإدارية', 'الحلقات التربوية', 'المحاسبة', 'العاملين']),
        }
      })

      console.log('✅ Admin password updated successfully!')
      console.log(`User ID: ${updatedAdmin.id}`)
      console.log(`Username: ${updatedAdmin.username}`)
      console.log(`Role: ${updatedAdmin.role}`)
      console.log(`Permissions: ${JSON.parse(updatedAdmin.permissions).join(', ')}`)
    }

    console.log('\n🎉 Password reset completed!')
    console.log('You can now login with:')
    console.log(`  Username: ${username}`)
    console.log(`  Password: ${newPassword}`)

  } catch (error) {
    console.error('❌ Error resetting admin password:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
