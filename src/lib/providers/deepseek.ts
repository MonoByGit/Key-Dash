import { BaseProvider, type RequestOptions, type ResponseResult } from './base';

export class DeepSeekProvider extends BaseProvider {
  constructor(apiKey: string) {
    super({
      name: 'deepseek',
      baseUrl: 'https://api.deepseek.com',
      authType: 'bearer',
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
      endpoint: '/chat/completions',
      method: 'POST',
      body,
    });
  }

  async listModels(): Promise<ResponseResult> {
    return {
      success: true,
      data: {
        models: ['deepseek-chat', 'deepseek-coder'],
      },
      latencyMs: 0,
    };
  }
}
