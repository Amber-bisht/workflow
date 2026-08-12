import { Resend } from "resend";

export class ResendService {
  /**
   * Send an email via Resend API
   */
  static async sendEmail(
    rawApiKey: string,
    rawFrom: string,
    to: string,
    subject: string,
    body: string
  ): Promise<{ id: string; success: boolean }> {
    const apiKey = (rawApiKey || "").replace(/^["']|["']$/g, "").replace(/%22$/gi, "").trim();
    const from = (rawFrom || "").replace(/^["']|["']$/g, "").replace(/%22$/gi, "").trim();
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: body.startsWith("<") ? body : `<p>${body.replace(/\n/g, "<br/>")}</p>`,
    });

    if (error) {
      throw new Error(`Resend email failed: ${error.message}`);
    }

    return {
      id: data?.id || "sent",
      success: true,
    };
  }
}
