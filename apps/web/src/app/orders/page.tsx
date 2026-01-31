import { listings, orders } from "@/lib/seed-data";
import { formatCrypto, formatCurrency, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  return (
    <section className="section">
      <div className="shell">
        <h1>Orders</h1>
        <p>Track orders, payment status, and fulfillment readiness.</p>
        <ul className="list">
          {orders.map((order) => {
            const listing = listings.find((item) => item.id === order.listingId);
            return (
              <li key={order.id}>
                <div className="card-title">{listing?.title}</div>
                <div className="card-meta">
                  <span>Status: {order.status}</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="price-row">
                  <span>{formatCurrency(order.totalFiatCents, order.currency)}</span>
                  <span className="price-crypto">{formatCrypto(order.totalCrypto)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
