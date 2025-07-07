export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  policy: string;
  operationType: string;
  retryAfterSeconds: number;
}

export interface RateLimitError {
  error: string;
  message: string;
  retryAfterSeconds: number;
  type: string;
  policy: string;
}

export class RateLimitHandler {
  private retryQueue: Map<string, Array<() => Promise<any>>> = new Map();
  private isProcessingQueue = false;
  private showNotification: (info: RateLimitInfo) => void;

  constructor(showNotification: (info: RateLimitInfo) => void) {
    this.showNotification = showNotification;
  }

  handleSuccess(response: any): any {
    const rateLimitInfo = this.extractRateLimitInfo(response);
    if (rateLimitInfo) {
      (response as any).rateLimitInfo = rateLimitInfo;
      
      if (rateLimitInfo.remaining < rateLimitInfo.limit * 0.2) {
        this.showNotification(rateLimitInfo);
      }
    }
    
    return response;
  }

  async handleRateLimit(error: any, config: any): Promise<any> {
    const rateLimitError = error.response?.data as RateLimitError;
    const retryKey = this.getRetryKey(config);
    
    if (!this.retryQueue.has(retryKey)) {
      this.retryQueue.set(retryKey, []);
    }
    
    const retryFunction = () => this.retryRequest(config, rateLimitError);
    this.retryQueue.get(retryKey)!.push(retryFunction);
    
    const rateLimitInfo: RateLimitInfo = {
      limit: 0,
      remaining: 0,
      reset: Date.now() + (rateLimitError.retryAfterSeconds * 1000),
      policy: rateLimitError.policy,
      operationType: 'unknown',
      retryAfterSeconds: rateLimitError.retryAfterSeconds
    };
    
    this.showNotification(rateLimitInfo);
    
    if (!this.isProcessingQueue) {
      await this.processRetryQueue(retryKey);
    }
    
    return Promise.reject(error);
  }

  private async retryRequest(config: any, rateLimitError: RateLimitError): Promise<any> {
    const delay = rateLimitError.retryAfterSeconds * 1000;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data
    });
  }

  private async processRetryQueue(retryKey: string): Promise<void> {
    this.isProcessingQueue = true;
    
    const queue = this.retryQueue.get(retryKey);
    if (!queue || queue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }
    
    while (queue.length > 0) {
      const retryFunction = queue.shift()!;
      try {
        await retryFunction();
      } catch (error) {
        console.error('Retry failed:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  private extractRateLimitInfo(response: any): RateLimitInfo | null {
    const headers = response.headers;
    
    if (!headers) return null;
    
    const limit = headers['x-ratelimit-limit'];
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    const policy = headers['x-ratelimit-policy'];
    const operationType = headers['x-ratelimit-operation-type'];
    
    if (!limit || !remaining || !reset) return null;
    
    return {
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      reset: parseInt(reset) * 1000,
      policy: policy || 'unknown',
      operationType: operationType || 'unknown',
      retryAfterSeconds: 60
    };
  }

  private getRetryKey(config: any): string {
    return `${config.method}:${config.url}`;
  }

  debounce(func: (...args: any[]) => any, delay: number): (...args: any[]) => void {
    let timeoutId: number;
    
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  createDeduplicatedRequest<T>(
    requestFn: () => Promise<T>,
    key: string
  ): () => Promise<T> {
    const pendingRequests = new Map<string, Promise<T>>();
    
    return async () => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
      }
      
      const promise = requestFn();
      pendingRequests.set(key, promise);
      
      try {
        const result = await promise;
        return result;
      } finally {
        pendingRequests.delete(key);
      }
    };
  }
} 