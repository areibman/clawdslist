import { getOrder } from "@/lib/data";
import Link from "next/link";

export default async function CheckoutPage({
  params
}: {
  params: { orderId: string };
}) {
  const order = await getOrder(params.orderId);

  if (!order) {
    return (
      <section className="card">
        <div className="pill">Checkout</div>
        <h1>Order status</h1>
        <p className="meta">
          This order doesn't exist yet. Create one from a listing to see the
          flow.
        </p>
        <Link className="btn" href="/">
          Browse listings
        </Link>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="pill">Checkout</div>
      <h1>Order {order.id}</h1>
      <p className="meta">Listing ID: {order.listingId}</p>
      <p>
        Status: <strong>{order.status}</strong>
      </p>
      <p>
        Total:{" "}
        {(order.totalCents / 100).toLocaleString("en-US", {
          style: "currency",
          currency: order.currency
        })}
      </p>
      <div className="divider" />
      <p className="meta">
        Use the API to initiate payment:
        <br />
        <code>/api/payments/checkout</code>
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn" href="/buyer-api">
          Buyer API docs
        </Link>
        <Link className="btn" href="/sell">
          Create more listings
        </Link>
      </div>
    </section>
  );
}
