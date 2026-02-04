import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  try {
    // Get all providers with key counts
    const providers = await prisma.provider.findMany({
      include: {
        keys: {
          where: { isActive: true },
        },
      },
    });

    // Get all active API keys with usage
    const apiKeys = await prisma.apiKey.findMany({
      where: { isActive: true },
      include: { provider: true },
      orderBy: { lastUsedAt: 'desc' },
    });

    // Calculate totals
    const totalRequests = apiKeys.reduce((sum, k) => sum + k.requests, 0);
    const totalInputTokens = apiKeys.reduce((sum, k) => sum + k.inputTokens, 0);
    const totalOutputTokens = apiKeys.reduce((sum, k) => sum + k.outputTokens, 0);
    const totalCost = apiKeys.reduce((sum, k) => sum + k.cost, 0);

    // Get recent logs (last 100)
    const recentLogs = await prisma.apiLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        apiKey: true,
        provider: true,
      },
    });

    // Group by provider for charts
    const providerStats = providers.map((p) => {
      const providerKeys = apiKeys.filter((k) => k.providerId === p.id);
      return {
        id: p.id,
        name: p.name,
        displayName: p.displayName,
        icon: p.icon,
        keyCount: providerKeys.length,
        requests: providerKeys.reduce((sum, k) => sum + k.requests, 0),
        cost: providerKeys.reduce((sum, k) => sum + k.cost, 0),
      };
    });

    return NextResponse.json({
      summary: {
        totalProviders: providers.length,
        totalKeys: apiKeys.length,
        totalRequests,
        totalInputTokens,
        totalOutputTokens,
        totalCost,
      },
      providers: providerStats,
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        provider: log.provider.displayName,
        model: log.model,
        cost: log.cost,
        latencyMs: log.latencyMs,
        statusCode: log.statusCode,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
