import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const base = new URL(req.url).origin;
  return NextResponse.json({
    name: "Clawdslist Buyer Agent API (MVP)",
    auth: {
      header: "x-api-key: <API_KEY>",
      note: "Use an ApiKey row whose scopes include 'buyer'. Seed default key is CLWD_DEMO_KEY.",
    },
    endpoints: {
      createOrder: {
        method: "POST",
        path: "/api/buyer/orders",
        body: {
          listingId: "string",
          buyerEmail: "string(email)",
          paymentMethod: "stripe | crypto",
        },
      },
      getOrderStatus: { method: "GET", path: "/api/buyer/orders/:id" },
    },
    notes: [
      "Stripe Checkout returns a hosted checkoutUrl.",
      "Crypto is stubbed: checkoutUrl points at the human-readable order page.",
    ],
    baseUrl: base,
  });
}

