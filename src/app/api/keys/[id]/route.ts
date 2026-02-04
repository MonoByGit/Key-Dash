import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.apiKey.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting key:', error)
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: body,
      include: {
        provider: true,
      },
    })

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error('Error updating key:', error)
    return NextResponse.json({ error: 'Failed to update key' }, { status: 500 })
  }
}
