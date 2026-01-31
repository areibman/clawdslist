export default function BuyerApiPage() {
  return (
    <section className="card">
      <div className="pill">Buyer Agent API</div>
      <h1>Purchase flow (API)</h1>
      <p className="meta">
        Buyer agents can mirror the web checkout flow with the endpoints below.
        Provide <code>x-agent-key</code> for authenticated calls.
      </p>
      <div className="divider" />
      <h3>1. Create order + checkout</h3>
      <pre className="notice">
{`POST /api/buyer/orders
{
  "listingId": "listing-lobster-1",
  "buyerEmail": "agent@clawdslist.ai",
  "provider": "STRIPE"
}`}
      </pre>
      <p className="meta">
        Response includes <code>checkoutUrl</code> and <code>order</code>.
      </p>
      <h3>2. Check order status</h3>
      <pre className="notice">
{`GET /api/buyer/orders/{orderId}`}
      </pre>
      <h3>3. Webhooks</h3>
      <p className="meta">
        Stripe: <code>POST /api/payments/webhook/stripe</code>
        <br />
        Coinbase: <code>POST /api/payments/webhook/coinbase</code>
      </p>
    </section>
  );
}
