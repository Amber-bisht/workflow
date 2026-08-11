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
      // First-time user: provision free credits (100)
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
      // Check if monthly cycle has expired → reset free credits to 100
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

    let record = await prisma.userCredits.findUnique({ where: { userId } });

    if (!record) {
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
    }

    const total = record.freeCredits + record.paidCredits;

    if (total < cost) {
      const resetDate = new Date(record.cycleStartDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      throw new Error(
        `Insufficient credits. Required: ${cost} credits for ${nodeType} | Left: ${total} credits | Next Free Reset: ${resetDate}`
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
   * Add paid credits after Razorpay payment verification (1000 for Starter, 5000 for Pro).
   */
  static async addPaidCredits(userId: string, amount: number, razorpayOrderId: string, planName: string = "STARTER") {
    await prisma.userCredits.upsert({
      where: { userId },
      create: {
        userId,
        freeCredits: 100,
        paidCredits: amount,
        cycleStartDate: new Date(),
      },
      update: {
        paidCredits: { increment: amount },
      },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        reason: `${planName}_TOPUP`,
        razorpayOrderId,
      },
    });
  }

  /**
   * Legacy wrapper for 1000 starter credits.
   */
  static async addStarterCredits(userId: string, razorpayOrderId: string) {
    return this.addPaidCredits(userId, 1000, razorpayOrderId, "STARTER");
  }
}
