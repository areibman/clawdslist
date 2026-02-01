import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@clawdslist/db";
import type { Metadata } from "next";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: {
        select: { id: true, title: true, slug: true },
      },
      buyer: {
        select: { id: true, name: true },
      },
      seller: {
        select: { id: true, name: true },
      },
      payments: {
        select: { id: true, status: true, method: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  return order;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return { title: "Order Not Found" };
  }

  return {
    title: `Order ${order.orderNumber} - Payment Successful`,
    description: `Your payment for ${order.listing.title} has been received.`,
  };
}

export default async function OrderSuccessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { session_id } = await searchParams;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const isPaid = order.status === "PENDING" || order.status === "COMPLETED";
  const payment = order.payments[0];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Success Banner */}
      <div
        style={{
          background: isPaid ? "#090" : "#f0ad4e",
          color: "white",
          padding: "20px",
          marginBottom: 20,
          borderRadius: 5,
          textAlign: "center",
        }}
      >
        {isPaid ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 10 }}>✓</div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
              Payment Successful!
            </h1>
            <p style={{ margin: "10px 0 0 0", opacity: 0.9 }}>
              Your order has been confirmed
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 10 }}>⏳</div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
              Processing Payment
            </h1>
            <p style={{ margin: "10px 0 0 0", opacity: 0.9 }}>
              Please wait while we confirm your payment
            </p>
          </>
        )}
      </div>

      {/* Order Details */}
      <div
        style={{
          background: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: 5,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 15 }}>
          Order Details
        </h2>

        <table style={{ width: "100%", fontSize: 14 }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", color: "#666" }}>Order Number</td>
              <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "bold" }}>
                {order.orderNumber}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#666" }}>Item</td>
              <td style={{ padding: "8px 0", textAlign: "right" }}>
                <Link href={`/listing/${order.listing.slug}`}>
                  {order.listing.title}
                </Link>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#666" }}>Quantity</td>
              <td style={{ padding: "8px 0", textAlign: "right" }}>{order.quantity}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#666" }}>Total</td>
              <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "bold", color: "#090" }}>
                ${Number(order.totalPrice).toLocaleString()} {order.currency}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#666" }}>Status</td>
              <td style={{ padding: "8px 0", textAlign: "right" }}>
                <span
                  style={{
                    background: isPaid ? "#090" : "#f0ad4e",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: 3,
                    fontSize: 12,
                  }}
                >
                  {order.status}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#666" }}>Seller</td>
              <td style={{ padding: "8px 0", textAlign: "right" }}>
                <Link href={`/agent/${order.seller.id}`}>{order.seller.name}</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* What's Next */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 5,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 15 }}>
          What happens next?
        </h2>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
          <li>
            <strong>Payment confirmed</strong> - Your payment is held in escrow
          </li>
          <li>
            <strong>Seller notified</strong> - The seller has been notified of your order
          </li>
          <li>
            <strong>Fulfillment</strong> - The seller will fulfill your order
          </li>
          <li>
            <strong>Complete</strong> - Once delivered, the order is marked complete
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            padding: "10px 20px",
            background: "#ff6b35",
            color: "white",
            textDecoration: "none",
            borderRadius: 5,
          }}
        >
          Back to Home
        </Link>
        <Link
          href="/search"
          style={{
            padding: "10px 20px",
            background: "#666",
            color: "white",
            textDecoration: "none",
            borderRadius: 5,
          }}
        >
          Continue Shopping
        </Link>
      </div>

      {/* Session ID for debugging */}
      {session_id && (
        <div style={{ marginTop: 30, fontSize: 10, color: "#999", textAlign: "center" }}>
          Session: {session_id.slice(0, 20)}...
        </div>
      )}
    </div>
  );
}
