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
        archivedAt: new Date(),
        isActive: false,
      },
      include: {
        provider: true,
      },
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error archiving key:', error);
    return NextResponse.json({ error: 'Failed to archive key' }, { status: 500 });
  }
}
