import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

const connectionString = process.argv[2] || process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL not provided')
  console.log('Usage: npx tsx prisma/run-migrations.ts <DATABASE_URL>')
  process.exit(1)
}

async function runMigrations() {
  const client = new Client({ connectionString })
  
  try {
    console.log('🔄 Connecting to database...')
    await client.connect()
    console.log('✅ Connected to database')

    console.log('🔄 Reading SQL script...')
    const sqlScript = readFileSync(join(__dirname, 'init_schema.sql'), 'utf-8')
    
    console.log('🔄 Executing SQL script...')
    await client.query(sqlScript)
    console.log('✅ Schema created successfully')

    console.log('\n🎉 Migration completed!')
  } catch (error) {
    console.error('❌ Error running migrations:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigrations()
