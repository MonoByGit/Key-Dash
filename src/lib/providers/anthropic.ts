import { BaseProvider, type RequestOptions, type ResponseResult } from './base';

export class AnthropicProvider extends BaseProvider {
  constructor(apiKey: string) {
    super({
      name: 'anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
      authType: 'bearer',
      defaultHeaders: {
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
    });
    this.apiKey = apiKey;
  }

  private apiKey: string;

  async call(options: RequestOptions): Promise<ResponseResult> {
    return this.fetchWithLogging(this.apiKey, options);
  }

  protected extractModel(response: { model?: string }): string {
    return response.model || 'unknown';
  }

  // Convenience methods for common operations
  async chatCompletion(
    body: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    }
  ): Promise<ResponseResult> {
    return this.call({
      endpoint: '/messages',
      method: 'POST',
      body,
    });
  }

  async listModels(): Promise<ResponseResult> {
    // Anthropic doesn't have a list models endpoint, return empty
    return {
      success: true,
      data: {
        models: [
          'claude-3-7-sonnet-20250529',
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
          'claude-3-haiku-20240307',
        ],
      },
      latencyMs: 0,
    };
  }
}
