import { Paystack } from "@paystack/paystack-sdk";
import crypto from "crypto";

export class PaystackService {
  private client: Paystack;

  constructor() {
    this.client = new Paystack(process.env.PAYSTACK_SECRET_KEY!);
  }

  async initializeTransaction(params: {
    email: string;
    amount: number;
    reference: string;
    metadata?: Record<string, any>;
    callback_url?: string;
  }) {
    return this.client.transaction.initialize({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      metadata: params.metadata,
      callback_url: params.callback_url || `${process.env.APP_URL}/payments/success`,
    });
  }

  async verifyTransaction(reference: string) {
    return this.client.transaction.verify(reference);
  }

  verifyWebhook(signature: string, body: any): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(body))
      .digest("hex");
    return hash === signature;
  }

  async getBanks() {
    return this.client.miscellaneous.getBanks({ country: "nigeria" });
  }
}
