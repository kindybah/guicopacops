// backend/prisma/seed.js
import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client' // IMPORT ENUM

async function main() {
  // Ensure meta singleton
  await prisma.meta.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      company: {
        name: 'Guicopac LLC',
        email: 'dispatch@guicopac.com',
        phone: '862-405-9937',
        area: 'NJ / NY Metro',
        desc: 'Medical & time-critical delivery provider'
      },
      targets: {
        onTime: 95,
        dailyOrders: 25,
        weeklyRevenue: 8000,
        lateThresholdMin: 15
      }
    }
  })

  // Admin user seed
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@guicopac.com'
  const pass = process.env.SEED_ADMIN_PASSWORD || 'Admin12345!'
  const hash = await bcrypt.hash(pass, 10)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hash,
      role: Role.ADMIN // 
    }
  })

  console.log('Seed complete.')
  console.log('Admin email:', email)
  console.log('Admin password:', pass)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
