import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'

export async function GET() {
  try {
    const keys = await prisma.apiKey.findMany({
      include: {
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(keys)
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
      },
      include: {
        provider: true,
      },
    })

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error('Error creating key:', error)
    return NextResponse.json({ error: 'Failed to create key' }, { status: 500 })
  }
}
