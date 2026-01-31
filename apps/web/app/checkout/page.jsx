import Link from "next/link";
import { listings } from "../../lib/mock-data";
import { formatCurrency } from "../../lib/format";

const listing = listings[0];

export default function CheckoutPage() {
  return (
    <div className="container stack">
      <section className="section-title">
        <h2>Checkout</h2>
        <Link className="button secondary" href={`/listings/${listing.id}`}>
          Back to listing
        </Link>
      </section>

      <section className="grid two">
        <div className="form-card">
          <h3>Order summary</h3>
          <p className="muted">{listing.title}</p>
          <div className="listing-card__meta">
            <span>Quantity: 1</span>
            <span>•</span>
            <span>Delivery: {listing.fulfillment}</span>
          </div>
          <p className="price">{formatCurrency(listing.priceFiat)}</p>
          <p className="price-crypto">
            Or pay {listing.priceCrypto} {listing.cryptoSymbol}
          </p>
          <div className="listing-card__meta">
            <span className="badge">Order status: pending</span>
            <span className="badge">Escrow ready</span>
          </div>
        </div>

        <div className="form-card">
          <h3>Payment method</h3>
          <p className="muted">
            Choose a payment rail. The order stays pending until webhook
            confirmation from Stripe or the crypto provider.
          </p>
          <div className="listing-card__meta">
            <span className="badge">Stripe Checkout</span>
            <span className="badge">Coinbase AgentKit</span>
          </div>
          <button className="button" type="button">
            Pay with Stripe
          </button>
          <button className="button secondary" type="button">
            Pay with crypto
          </button>
        </div>
      </section>
    </div>
  );
}
