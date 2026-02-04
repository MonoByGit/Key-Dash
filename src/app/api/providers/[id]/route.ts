import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.provider.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting provider:', error)
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const provider = await prisma.provider.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(provider)
  } catch (error) {
    console.error('Error updating provider:', error)
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}
