import { BaseProvider, type RequestOptions, type ResponseResult } from './base';

export class MinimaxProvider extends BaseProvider {
  constructor(apiKey: string) {
    super({
      name: 'minimax',
      baseUrl: 'https://api.minimax.chat/v1',
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
      endpoint: '/chat/completions_v2',
      method: 'POST',
      body,
    });
  }

  async listModels(): Promise<ResponseResult> {
    return {
      success: true,
      data: {
        models: ['minimax-2.1', 'minimax-2.0-flash'],
      },
      latencyMs: 0,
    };
  }
}
