import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const providers = [
  {
    name: 'anthropic',
    displayName: 'Anthropic',
    icon: '🤖',
    baseUrl: 'https://api.anthropic.com',
    authType: 'x-api-key',
    headers: { 'anthropic-version': '2023-06-01' },
    pricing: { inputPer1M: 3, outputPer1M: 15 }
  },
  {
    name: 'openai',
    displayName: 'OpenAI',
    icon: '🧠',
    baseUrl: 'https://api.openai.com/v1',
    authType: 'bearer',
    pricing: { inputPer1M: 0.5, outputPer1M: 1.5 }
  },
  {
    name: 'deepseek',
    displayName: 'DeepSeek',
    icon: '🔍',
    baseUrl: 'https://api.deepseek.com',
    authType: 'bearer',
    pricing: { inputPer1M: 0.14, outputPer1M: 0.28 }
  },
  {
    name: 'minimax',
    displayName: 'Minimax',
    icon: '⚡',
    baseUrl: 'https://api.minimax.chat/v1',
    authType: 'bearer',
    pricing: { inputPer1M: 0.7, outputPer1M: 0.7 }
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
