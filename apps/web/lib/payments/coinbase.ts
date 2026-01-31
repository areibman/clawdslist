import { PaymentAdapter } from "./types";

const coinbaseEndpoint =
  process.env.COINBASE_COMMERCE_ENDPOINT ?? "https://api.commerce.coinbase.com";

export const coinbaseAdapter: PaymentAdapter = {
  provider: "COINBASE",
  async createCheckout({ orderId, amountCents, currency, successUrl }) {
    const amount = (amountCents / 100).toFixed(2);

    if (!process.env.COINBASE_COMMERCE_KEY) {
      return {
        provider: "COINBASE",
        checkoutUrl: `${successUrl}?provider=coinbase&orderId=${orderId}`,
        externalId: `coinbase_stub_${Date.now()}`
      };
    }

    const response = await fetch(`${coinbaseEndpoint}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": process.env.COINBASE_COMMERCE_KEY,
        "X-CC-Version": "2018-03-22"
      },
      body: JSON.stringify({
        name: "Clawdslist order",
        description: `Order ${orderId}`,
        pricing_type: "fixed_price",
        local_price: {
          amount,
          currency
        },
        metadata: { orderId },
        redirect_url: successUrl,
        cancel_url: successUrl
      })
    });

    if (!response.ok) {
      throw new Error("Coinbase charge creation failed.");
    }

    const data = await response.json();
    return {
      provider: "COINBASE",
      checkoutUrl: data.data.hosted_url,
      externalId: data.data.id
    };
  }
};
