import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const archived = searchParams.get('archived') === 'true'

    const keys = await prisma.apiKey.findMany({
      where: {
        archivedAt: archived ? { not: null } : null,
      },
      include: {
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Don't return encrypted keys in list
    const safeKeys = keys.map(({ key, ...rest }) => rest)

    return NextResponse.json(safeKeys)
  } catch (error) {
    console.error('Error fetching keys:', error)
    return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Encrypt the API key before storing
    const encryptedKey = encrypt(body.key)

    const apiKey = await prisma.apiKey.create({
      data: {
        name: body.name,
        label: body.label || null,
        key: encryptedKey,
        providerId: body.providerId,
        rateLimit: body.rateLimit || null,
        isActive: true,
      },
      include: {
        provider: true,
      },
    })

    // Don't return encrypted key
    const { key, ...safeKey } = apiKey
    return NextResponse.json(safeKey)
  } catch (error) {
    console.error('Error creating key:', error)
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 })
  }
}
