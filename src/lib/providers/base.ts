import { calculateCost, extractTokenUsage, type CostResult, type ProviderName, type TokenUsage } from '../pricing';

export interface ProviderConfig {
  name: ProviderName;
  baseUrl: string;
  authType: 'bearer' | 'header' | 'basic' | 'api_key';
  authHeader?: string;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ResponseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  latencyMs: number;
  usage?: TokenUsage;
  cost?: CostResult;
}

// Base provider class that all providers extend
export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract call(options: RequestOptions): Promise<ResponseResult>;

  protected getHeaders(apiKey: string, additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
      ...additionalHeaders,
    };

    switch (this.config.authType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'header':
        if (this.config.authHeader) {
          headers[this.config.authHeader] = apiKey;
        }
        break;
      case 'basic':
        headers['Authorization'] = `Basic ${Buffer.from(apiKey).toString('base64')}`;
        break;
      case 'api_key':
        headers['X-API-Key'] = apiKey;
        break;
    }

    return headers;
  }

  protected async fetchWithLogging<T>(
    apiKey: string,
    options: RequestOptions,
    onLog?: (data: {
      endpoint: string;
      method: string;
      statusCode?: number;
      latencyMs: number;
      usage?: TokenUsage;
      cost?: CostResult;
      error?: string;
      requestBody?: Record<string, unknown>;
      responseBody?: T;
    }) => Promise<void>
  ): Promise<ResponseResult<T>> {
    const startTime = Date.now();

    try {
      const body = options.body ? JSON.stringify(options.body) : undefined;
      const headers = this.getHeaders(apiKey, options.headers);

      const controller = new AbortController();
      const timeout = options.timeout || 60000; // Default 60s
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.config.baseUrl}${options.endpoint}`, {
        method: options.method || 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      const responseData = await response.json().catch(() => ({}));

      // Extract token usage from response
      const usage = extractTokenUsage(this.config.name, responseData);

      // Calculate cost
      const model = this.extractModel(responseData);
      const cost = calculateCost(this.config.name, model, usage);

      // Log the request
      if (onLog) {
        await onLog({
          endpoint: options.endpoint,
          method: options.method || 'POST',
          statusCode: response.status,
          latencyMs,
          usage,
          cost,
          requestBody: options.body,
          responseBody: responseData,
        });
      }

      if (!response.ok) {
        return {
          success: false,
          error: (responseData.error?.message || responseData.error || 'Request failed') as string,
          statusCode: response.status,
          latencyMs,
          usage,
          cost,
          data: responseData,
        };
      }

      return {
        success: true,
        data: responseData,
        statusCode: response.status,
        latencyMs,
        usage,
        cost,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed request
      if (onLog) {
        await onLog({
          endpoint: options.endpoint,
          method: options.method || 'POST',
          latencyMs,
          error: errorMessage,
          requestBody: options.body,
        });
      }

      return {
        success: false,
        error: errorMessage,
        latencyMs,
      };
    }
  }

  protected extractModel(response: Record<string, unknown>): string {
    // Override in subclasses for provider-specific extraction
    return response.model as string || 'unknown';
  }
}

// Factory function to create provider instances
export function createProvider(provider: ProviderName, apiKey: string): BaseProvider {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'anthropic':
      return new AnthropicProvider(apiKey);
    case 'deepseek':
      return new DeepSeekProvider(apiKey);
    case 'minimax':
      return new MinimaxProvider(apiKey);
    case 'google':
      return new GoogleProvider(apiKey);
    case 'azure':
      // Azure requires additional configuration - use directly with proper constructor
      throw new Error('Azure requires resourceName and deploymentId. Use new AzureProvider(apiKey, resourceName, deploymentId) directly.');
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Import provider implementations
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { DeepSeekProvider } from './deepseek';
import { MinimaxProvider } from './minimax';
import { GoogleProvider } from './google';
import { AzureProvider } from './azure';
