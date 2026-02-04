import { BaseProvider, type RequestOptions, type ResponseResult } from './base';

export class AzureProvider extends BaseProvider {
  private apiKey: string;
  private deploymentId: string;

  constructor(apiKey: string, resourceName: string, deploymentId: string) {
    super({
      name: 'azure',
      baseUrl: `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentId}`,
      authType: 'bearer',
    });
    this.apiKey = apiKey;
    this.deploymentId = deploymentId;
  }

  async call(options: RequestOptions): Promise<ResponseResult> {
    // Add api-version header for Azure
    const headers = {
      ...options.headers,
      'api-version': '2024-02-15-preview',
    };

    return this.fetchWithLogging(this.apiKey, { ...options, headers });
  }

  protected extractModel(response: { model?: string }): string {
    return response.model || this.deploymentId || 'unknown';
  }

  // Convenience methods for common operations
  async chatCompletion(
    body: {
      model?: string;
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
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-35-turbo'],
      },
      latencyMs: 0,
    };
  }
}
