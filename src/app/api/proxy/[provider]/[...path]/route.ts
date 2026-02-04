import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { calculateCost, extractTokenUsage } from '@/lib/pricing';

const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'deepseek', 'minimax', 'google', 'azure'] as const;

type ProviderName = typeof SUPPORTED_PROVIDERS[number];

// Provider base URLs
const PROVIDER_BASE_URLS: Record<ProviderName, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  deepseek: 'https://api.deepseek.com',
  minimax: 'https://api.minimax.chat/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  azure: '', // Azure requires special handling with resource name
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; path: string[] }> }
) {
  const { provider: providerName, path } = await params;

  // Validate provider
  if (!SUPPORTED_PROVIDERS.includes(providerName as ProviderName)) {
    return NextResponse.json(
      { error: `Provider '${providerName}' is niet ondersteund` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const apiKeyId = body._keyId || body.apiKeyId;

    if (!apiKeyId) {
      return NextResponse.json(
        { error: 'API key ID is verplicht (voeg _keyId toe aan body)' },
        { status: 400 }
      );
    }

    // Get API key from database
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      include: { provider: true },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key niet gevonden' },
        { status: 404 }
      );
    }

    if (!apiKey.isActive) {
      return NextResponse.json(
        { error: 'API key is niet actief' },
        { status: 403 }
      );
    }

    // Decrypt API key
    const decryptedKey = decrypt(apiKey.key);

    // Forward request to provider
    const endpoint = '/' + path.join('/');
    const startTime = Date.now();

    try {
      const baseUrl = PROVIDER_BASE_URLS[providerName as ProviderName];
      const url = `${baseUrl}${endpoint}`;

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add provider-specific auth
      if (providerName === 'anthropic') {
        headers['anthropic-version'] = '2023-06-01';
        headers['Authorization'] = `Bearer ${decryptedKey}`;
      } else if (providerName === 'google') {
        headers['X-API-Key'] = decryptedKey;
      } else {
        headers['Authorization'] = `Bearer ${decryptedKey}`;
      }

      // Forward request
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const latencyMs = Date.now() - startTime;
      const responseData = await response.json().catch(() => ({}));

      // Extract and calculate usage/cost
      const usage = extractTokenUsage(providerName as ProviderName, responseData);
      const model = extractModel(providerName as ProviderName, responseData);
      const costResult = calculateCost(providerName as ProviderName, model, usage);

      // Log to database (fire and forget)
      logRequest({
        apiKeyId,
        providerId: providerName,
        endpoint,
        model,
        usage,
        cost: costResult.totalCost,
        latencyMs,
        statusCode: response.status,
        requestBody: body,
        responseBody: responseData,
      }).catch(console.error);

      if (!response.ok) {
        return NextResponse.json(
          {
            error: responseData.error?.message || 'Request failed',
            usage,
            cost: costResult.totalCost,
          },
          { status: response.status }
        );
      }

      // Update API key aggregate counters (fire and forget)
      updateApiKeyCounters(apiKeyId, usage, costResult.totalCost)
        .catch(console.error);

      return NextResponse.json({
        ...responseData,
        _meta: {
          usage,
          cost: costResult.totalCost,
          latencyMs,
        },
      });
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error('Forward request error:', error);

      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Request failed',
          latencyMs,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    );
  }
}

function extractModel(provider: ProviderName, response: Record<string, unknown>): string {
  switch (provider) {
    case 'openai':
    case 'anthropic':
    case 'deepseek':
    case 'minimax':
      return (response.model as string) || 'unknown';
    case 'google':
      return (response.modelVersion as string) || 'unknown';
    case 'azure':
      return (response.model as string) || 'unknown';
    default:
      return 'unknown';
  }
}

async function logRequest(data: {
  apiKeyId: string;
  providerId: string;
  endpoint: string;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
  cost: number;
  latencyMs: number;
  statusCode?: number;
  requestBody: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
}): Promise<void> {
  await prisma.apiLog.create({
    data: {
      apiKeyId: data.apiKeyId,
      providerId: data.providerId,
      endpoint: data.endpoint,
      method: 'POST',
      model: data.model,
      inputTokens: data.usage.inputTokens,
      outputTokens: data.usage.outputTokens,
      cost: data.cost,
      latencyMs: data.latencyMs,
      statusCode: data.statusCode,
      requestBody: data.requestBody as any,
      responseBody: data.responseBody as any,
    },
  });
}

async function updateApiKeyCounters(
  apiKeyId: string,
  usage: { inputTokens: number; outputTokens: number },
  cost: number
): Promise<void> {
  await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: {
      requests: { increment: 1 },
      inputTokens: { increment: usage.inputTokens },
      outputTokens: { increment: usage.outputTokens },
      cost: { increment: cost },
      lastUsedAt: new Date(),
    },
  });
}
