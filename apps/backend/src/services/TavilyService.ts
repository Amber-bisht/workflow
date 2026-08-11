export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  query: string;
  answer: string;
  results: TavilySearchResult[];
}

export class TavilyService {
  /**
   * Perform AI-powered web search/research via Tavily API
   */
  static async search(
    apiKey: string,
    query: string,
    maxResults: number = 5,
    searchDepth: "basic" | "advanced" = "basic"
  ): Promise<TavilySearchResponse> {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: searchDepth,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Tavily search failed (${response.status}): ${err}`);
    }

    const data = await response.json() as any;

    return {
      query: data.query || query,
      answer: data.answer || "",
      results: (data.results || []).map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        content: r.content || "",
        score: r.score || 0,
      })),
    };
  }
}
