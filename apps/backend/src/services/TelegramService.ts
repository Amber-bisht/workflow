export class TelegramService {
  /**
   * Send a text message via Telegram Bot API
   */
  static async sendMessage(
    rawBotToken: string,
    rawChatId: string,
    text: string
  ): Promise<{ ok: boolean; message_id: number }> {
    const botToken = (rawBotToken || "").replace(/^["']|["']$/g, "").replace(/%22$/gi, "").trim();
    const rawId = (rawChatId || "").replace(/^["']|["']$/g, "").replace(/%22$/gi, "").trim();
    const candidateIds = [rawId];
    if (!rawId.startsWith("-") && !rawId.startsWith("@")) {
      candidateIds.push(`-100${rawId}`);
    }

    let lastError = "";

    for (const candidate of candidateIds) {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: candidate,
          text,
          parse_mode: "HTML",
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        if (data.ok) {
          return {
            ok: true,
            message_id: data.result.message_id,
          };
        }
        lastError = data.description;
      } else {
        lastError = await response.text();
      }
    }

    throw new Error(`Telegram sendMessage failed: ${lastError}. Ensure @asprin_dev_bot is added to chat/group.`);
  }
}
