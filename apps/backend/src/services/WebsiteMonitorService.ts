export interface WebsiteMonitorResult {
  url: string;
  isUp: boolean;
  statusCode: number | null;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
}

export class WebsiteMonitorService {
  /**
   * Check if a website is up by making an HTTP HEAD request
   */
  static async check(
    url: string,
    expectedStatus: number = 200,
    timeoutMs: number = 8000
  ): Promise<WebsiteMonitorResult> {
    const start = Date.now();
    const checkedAt = new Date().toISOString();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeout);

      const responseTimeMs = Date.now() - start;
      const isUp = response.status === expectedStatus || (response.status >= 200 && response.status < 400);

      return {
        url,
        isUp,
        statusCode: response.status,
        responseTimeMs,
        checkedAt,
      };
    } catch (error: any) {
      const responseTimeMs = Date.now() - start;
      const isTimeout = error.name === "AbortError";

      return {
        url,
        isUp: false,
        statusCode: null,
        responseTimeMs,
        checkedAt,
        error: isTimeout ? `Request timed out after ${timeoutMs}ms` : error.message,
      };
    }
  }
}
