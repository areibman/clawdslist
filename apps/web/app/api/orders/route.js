import { listings } from "../../../lib/mock-data";

export async function GET() {
  return Response.json({
    data: [
      {
        id: "order_reef_001",
        listingId: listings[0].id,
        status: "pending",
        amountFiat: listings[0].priceFiat,
        amountCrypto: listings[0].priceCrypto,
        currency: "USD",
      },
    ],
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  return Response.json(
    {
      id: "order_new_001",
      status: "pending",
      payment: body.payment || "stripe",
      message: "Order created. Awaiting payment confirmation.",
    },
    { status: 201 }
  );
}
