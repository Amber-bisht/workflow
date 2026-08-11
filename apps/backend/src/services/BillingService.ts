import { prisma } from "@nextflow/database";

export const CREDIT_COSTS: Record<string, number> = {
  LLM: 5,
  OpenRouter: 5,
  Gemini: 5,
  TelegramSend: 1,
  ResendEmail: 1,
  HTTPRequest: 1,
  WebsiteMonitor: 2,
  TavilySearch: 3,
  // Zero-cost passthrough nodes
  RequestInputs: 0,
  Response: 0,
};

export class BillingService {
  /**
   * Get or create a UserCredits record for a user.
   * Also resets free credits if 30 days have passed since cycleStartDate.
   */
  static async getCredits(userId: string) {
    let record = await prisma.userCredits.findUnique({ where: { userId } });

    if (!record) {
      // First-time user: provision free credits
      record = await prisma.userCredits.create({
        data: {
          userId,
          freeCredits: 100,
          paidCredits: 0,
          cycleStartDate: new Date(),
        },
      });
      await prisma.creditTransaction.create({
        data: { userId, amount: 100, reason: "FREE_GRANT" },
      });
    } else {
      // Check if monthly cycle has expired → reset free credits
      const cycleStart = new Date(record.cycleStartDate);
      const now = new Date();
      const daysDiff = (now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 30) {
        record = await prisma.userCredits.update({
          where: { userId },
          data: {
            freeCredits: 100,
            paidCredits: 0,
            cycleStartDate: now,
          },
        });
        await prisma.creditTransaction.create({
          data: { userId, amount: 100, reason: "FREE_GRANT" },
        });
      }
    }

    return {
      freeCredits: record.freeCredits,
      paidCredits: record.paidCredits,
      total: record.freeCredits + record.paidCredits,
      cycleStartDate: record.cycleStartDate,
    };
  }

  /**
   * Check if user has enough credits. Throws if insufficient.
   */
  static async checkAndDeduct(
    userId: string,
    nodeType: string,
    workflowRunId: string,
    nodeRunId: string
  ) {
    const cost = CREDIT_COSTS[nodeType] ?? 1;
    if (cost === 0) return; // free node

    const record = await prisma.userCredits.findUnique({ where: { userId } });
    const total = (record?.freeCredits ?? 0) + (record?.paidCredits ?? 0);

    if (total < cost) {
      throw new Error(
        `Insufficient credits. Need ${cost} credits for ${nodeType} node but have ${total}. Top up at automation.amberbisht.me/dashboard/billing`
      );
    }

    // Deduct from paid credits first, then free
    let remaining = cost;
    let newPaid = record!.paidCredits;
    let newFree = record!.freeCredits;

    if (newPaid >= remaining) {
      newPaid -= remaining;
      remaining = 0;
    } else {
      remaining -= newPaid;
      newPaid = 0;
      newFree -= remaining;
    }

    await prisma.userCredits.update({
      where: { userId },
      data: { freeCredits: newFree, paidCredits: newPaid },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: -cost,
        reason: "NODE_RUN",
        nodeType,
        workflowRunId,
        nodeRunId,
      },
    });
  }

  /**
   * Add 1000 paid credits after Razorpay Starter Pack payment.
   */
  static async addStarterCredits(userId: string, razorpayOrderId: string) {
    await prisma.userCredits.upsert({
      where: { userId },
      create: {
        userId,
        freeCredits: 100,
        paidCredits: 1000,
        cycleStartDate: new Date(),
      },
      update: {
        paidCredits: { increment: 1000 },
      },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount: 1000,
        reason: "STARTER_TOPUP",
        razorpayOrderId,
      },
    });
  }
}
