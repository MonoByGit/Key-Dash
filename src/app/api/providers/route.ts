import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        _count: {
          select: { keys: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(providers)
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const provider = await prisma.provider.create({
      data: {
        name: body.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: body.displayName,
        icon: body.icon || null,
        baseUrl: body.baseUrl || null,
        authType: body.authType || 'bearer',
        pricing: body.pricing || null,
      },
    })

    return NextResponse.json(provider)
  } catch (error) {
    console.error('Error creating provider:', error)
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 })
  }
}
