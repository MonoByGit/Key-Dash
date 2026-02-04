import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const providerId = searchParams.get('providerId');

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get usage records
    const usageRecords = await prisma.apiLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        ...(providerId ? { providerId } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyUsage = new Map<string, {
      date: string;
      requests: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    }>();

    usageRecords.forEach((log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      const existing = dailyUsage.get(date) || {
        date,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      dailyUsage.set(date, {
        ...existing,
        requests: existing.requests + 1,
        inputTokens: existing.inputTokens + log.inputTokens,
        outputTokens: existing.outputTokens + log.outputTokens,
        cost: existing.cost + log.cost,
      });
    });

    // Group by provider
    const providerUsage = new Map<string, {
      provider: string;
      requests: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    }>();

    usageRecords.forEach((log) => {
      const existing = providerUsage.get(log.providerId) || {
        provider: log.providerId,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0,
      };

      providerUsage.set(log.providerId, {
        ...existing,
        requests: existing.requests + 1,
        inputTokens: existing.inputTokens + log.inputTokens,
        outputTokens: existing.outputTokens + log.outputTokens,
        cost: existing.cost + log.cost,
      });
    });

    return NextResponse.json({
      period: { start: startDate, end: new Date(), days },
      daily: Array.from(dailyUsage.values()),
      byProvider: Array.from(providerUsage.values()),
    });
  } catch (error) {
    console.error('Usage history error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
