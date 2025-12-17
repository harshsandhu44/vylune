import crypto from 'crypto';

const POLAR_API_URL = process.env.POLAR_API_URL || 'https://api.polar.sh';
const POLAR_API_KEY = process.env.POLAR_API_KEY || '';
const POLAR_BASE_PRODUCT_ID = process.env.POLAR_BASE_PRODUCT_ID || '';
const POLAR_ADDITIONAL_SEAT_PRICE_ID = process.env.POLAR_ADDITIONAL_SEAT_PRICE_ID || '';

export class PolarService {
  private apiKey: string;

  constructor(apiKey: string = POLAR_API_KEY) {
    this.apiKey = apiKey;
  }

  async createCheckout(params: {
    organizationId: string;
    organizationName: string;
    customerEmail: string;
    seatCount: number;
    successUrl: string;
  }): Promise<{ checkoutId: string; checkoutUrl: string }> {
    const baseSeats = 5;
    const additionalSeats = Math.max(0, params.seatCount - baseSeats);

    const response = await fetch(`${POLAR_API_URL}/v1/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: POLAR_BASE_PRODUCT_ID,
        customer_email: params.customerEmail,
        success_url: params.successUrl,
        metadata: {
          organizationId: params.organizationId,
          organizationName: params.organizationName,
          seatCount: params.seatCount,
        },
        line_items: [
          {
            price_id: POLAR_BASE_PRODUCT_ID,
            quantity: 1,
          },
          ...(additionalSeats > 0
            ? [
                {
                  price_id: POLAR_ADDITIONAL_SEAT_PRICE_ID,
                  quantity: additionalSeats,
                },
              ]
            : []),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Polar API error: ${error}`);
    }

    const data = await response.json();
    return {
      checkoutId: data.id,
      checkoutUrl: data.url,
    };
  }

  async updateSubscription(params: {
    subscriptionId: string;
    seatCount: number;
  }): Promise<any> {
    const baseSeats = 5;
    const additionalSeats = Math.max(0, params.seatCount - baseSeats);

    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions/${params.subscriptionId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quantity: params.seatCount,
        metadata: {
          seatCount: params.seatCount,
          additionalSeats,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Polar API error: ${error}`);
    }

    return response.json();
  }

  async cancelSubscription(params: {
    subscriptionId: string;
    cancelAtPeriodEnd: boolean;
  }): Promise<any> {
    const response = await fetch(
      `${POLAR_API_URL}/v1/subscriptions/${params.subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancel_at_period_end: params.cancelAtPeriodEnd,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Polar API error: ${error}`);
    }

    return response.json();
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return digest === signature;
  }
}

export const polarService = new PolarService();
