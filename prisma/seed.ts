import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const providers = [
  {
    name: 'anthropic',
    displayName: 'Anthropic',
    icon: 'bot',
    baseUrl: 'https://api.anthropic.com/v1',
    authType: 'bearer',
    headers: { 'anthropic-version': '2023-06-01' }
  },
  {
    name: 'openai',
    displayName: 'OpenAI',
    icon: 'brain',
    baseUrl: 'https://api.openai.com/v1',
    authType: 'bearer'
  },
  {
    name: 'deepseek',
    displayName: 'DeepSeek',
    icon: 'search',
    baseUrl: 'https://api.deepseek.com',
    authType: 'bearer'
  },
  {
    name: 'minimax',
    displayName: 'Minimax',
    icon: 'zap',
    baseUrl: 'https://api.minimax.chat/v1',
    authType: 'bearer'
  },
  {
    name: 'google',
    displayName: 'Google AI',
    icon: 'globe',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    authType: 'api_key'
  },
  {
    name: 'azure',
    displayName: 'Azure OpenAI',
    icon: 'cloud',
    baseUrl: '',
    authType: 'bearer'
  }
]

async function main() {
  console.log('Seeding providers...')

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { name: provider.name },
      update: provider,
      create: provider,
    })
  }

  // Create admin user if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@keydash.local'
  const adminPassword = process.env.ADMIN_PASSWORD || 'keydash2024'

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingUser) {
    console.log('Creating admin user...')
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword
      }
    })
    console.log(`Admin user created: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
  }

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
