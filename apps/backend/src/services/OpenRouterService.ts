import { env } from "../config/env";

export interface OpenRouterPayload {
  prompt: string;
  systemInstruction?: string;
  images?: string[];
  model?: string;
  temperature?: number;
}

export class OpenRouterService {
  /**
   * Execute OpenRouter API for multimodal (text + vision) inference
   */
  static async generateContent(payload: OpenRouterPayload): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenRouter API Key is missing. Please set OPENROUTER_API_KEY in environment variables."
      );
    }

    const {
      prompt,
      systemInstruction,
      images = [],
      model = "openai/gpt-4o",
      temperature = 0.7,
    } = payload;

    console.log(`[OpenRouterService] Executing model: ${model} with ${images.length} images`);

    // Prepare message contents array
    const userContent: any[] = [{ type: "text", text: prompt || "Analyze this." }];

    // Attach vision images (Base64 Data URLs or HTTP URLs)
    for (const img of images) {
      if (!img || typeof img !== "string" || img.trim() === "") continue;

      userContent.push({
        type: "image_url",
        image_url: {
          url: img,
        },
      });
    }

    const messages: any[] = [];

    if (systemInstruction && systemInstruction.trim() !== "") {
      messages.push({
        role: "system",
        content: systemInstruction.trim(),
      });
    }

    messages.push({
      role: "user",
      content: userContent,
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://automation.amberbisht.me",
        "X-Title": "automation.amberbisht.me Canvas",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "openai/gpt-4o",
        messages,
        temperature: temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OpenRouterService] Error ${response.status}:`, errorText);

      // Auto-fallback to openrouter/free if requested model is unavailable or 404
      if (model !== "openrouter/free" && (response.status === 404 || errorText.includes("No endpoints found"))) {
        console.warn(`[OpenRouterService] Model ${model} not available on OpenRouter, retrying with openrouter/free...`);
        return this.generateContent({ ...payload, model: "openrouter/free" });
      }

      throw new Error(`OpenRouter API call failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error("OpenRouter API returned empty response choice.");
    }

    if (typeof messageContent === "string") {
      return messageContent;
    } else if (Array.isArray(messageContent)) {
      return messageContent.map((c: any) => c.text || "").join("");
    }

    return String(messageContent);
  }
}
