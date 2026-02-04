// Provider pricing in dollars per 1M tokens
// Updated February 2025

export const PROVIDER_PRICING = {
  openai: {
    'gpt-4o': { input: 5.00, output: 15.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  },
  anthropic: {
    'claude-3-7-sonnet-20250529': { input: 3.00, output: 15.00 },
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
    'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  },
  deepseek: {
    'deepseek-chat': { input: 0.14, output: 0.28 },
    'deepseek-coder': { input: 0.14, output: 0.28 },
  },
  minimax: {
    'minimax-2.1': { input: 0.70, output: 0.70 },
    'minimax-2.0-flash': { input: 0.50, output: 0.50 },
  },
  google: {
    'gemini-1.5-pro': { input: 7.00, output: 21.00 },
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-1.0-pro': { input: 0.50, output: 1.50 },
  },
  azure: {
    'gpt-4o': { input: 5.00, output: 15.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-35-turbo': { input: 0.50, output: 1.50 },
  },
} as const;

export type ProviderName = keyof typeof PROVIDER_PRICING;

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CostResult {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

// Calculate cost for a given model and token usage
export function calculateCost(
  provider: ProviderName,
  model: string,
  usage: TokenUsage
): CostResult {
  const providerPricing = PROVIDER_PRICING[provider];
  const modelPricing = providerPricing?.[model as keyof typeof providerPricing] as { input: number; output: number } | undefined;

  if (!modelPricing) {
    // Unknown model - return 0 cost (will be logged for manual review)
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }

  const inputCost = (usage.inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (usage.outputTokens / 1_000_000) * modelPricing.output;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

// Extract token usage from different provider response formats
export function extractTokenUsage(
  provider: ProviderName,
  response: Record<string, unknown>
): TokenUsage {
  switch (provider) {
    case 'openai':
    case 'azure': {
      const usage = response.usage as { input_tokens?: number; output_tokens?: number } | undefined;
      return {
        inputTokens: usage?.input_tokens || 0,
        outputTokens: usage?.output_tokens || 0,
      };
    }

    case 'anthropic': {
      const usage = response.usage as { input_tokens?: number; output_tokens?: number } | undefined;
      return {
        inputTokens: usage?.input_tokens || 0,
        outputTokens: usage?.output_tokens || 0,
      };
    }

    case 'deepseek': {
      const usage = response.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
      return {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
      };
    }

    case 'minimax': {
      const usage = response.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
      return {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
      };
    }

    case 'google': {
      const metadata = response.usageMetadata as { inputTokenCount?: number; outputTokenCount?: number } | undefined;
      return {
        inputTokens: metadata?.inputTokenCount || 0,
        outputTokens: metadata?.outputTokenCount || 0,
      };
    }

    default:
      return { inputTokens: 0, outputTokens: 0 };
  }
}

// Get available models for a provider
export function getProviderModels(provider: ProviderName): string[] {
  const models = PROVIDER_PRICING[provider];
  return models ? Object.keys(models) : [];
}

// Check if a model is known for a provider
export function isKnownModel(provider: ProviderName, model: string): boolean {
  const models = PROVIDER_PRICING[provider];
  return models ? model in models : false;
}
