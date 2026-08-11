export class TelegramService {
  /**
   * Send a text message via Telegram Bot API
   */
  static async sendMessage(
    botToken: string,
    chatId: string,
    text: string
  ): Promise<{ ok: boolean; message_id: number }> {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Telegram sendMessage failed (${response.status}): ${err}`);
    }

    const data = await response.json() as any;
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return {
      ok: true,
      message_id: data.result.message_id,
    };
  }
}
