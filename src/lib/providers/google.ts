import { BaseProvider, type RequestOptions, type ResponseResult } from './base';

export class GoogleProvider extends BaseProvider {
  constructor(apiKey: string) {
    super({
      name: 'google',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      authType: 'api_key',
      authHeader: 'X-API-Key',
    });
    this.apiKey = apiKey;
  }

  private apiKey: string;

  async call(options: RequestOptions): Promise<ResponseResult> {
    return this.fetchWithLogging(this.apiKey, options);
  }

  protected extractModel(response: { modelVersion?: string }): string {
    return response.modelVersion || 'unknown';
  }

  // Convenience methods for common operations
  async chatCompletion(
    body: {
      model: string;
      contents: Array<{ role?: string; parts: Array<{ text: string }> }>;
      temperature?: number;
      maxOutputTokens?: number;
    }
  ): Promise<ResponseResult> {
    const { model, ...restBody } = body;

    return this.call({
      endpoint: `/models/${model}:generateContent`,
      method: 'POST',
      body: restBody as Record<string, unknown>,
    });
  }

  async listModels(): Promise<ResponseResult> {
    return this.call({
      endpoint: '/models',
      method: 'GET',
    });
  }
}
