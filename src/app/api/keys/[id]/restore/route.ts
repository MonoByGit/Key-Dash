import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: {
        archivedAt: null,
        isActive: true,
      },
      include: {
        provider: true,
      },
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error restoring key:', error);
    return NextResponse.json({ error: 'Failed to restore key' }, { status: 500 });
  }
}
