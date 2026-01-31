const Endpoint = ({ method, path, description }: { method: string; path: string; description: string }) => {
  return (
    <div className="callout">
      <strong>{method}</strong> {path}
      <p>{description}</p>
    </div>
  );
};

export default function AgentApiPage() {
  return (
    <section className="section">
      <div className="shell split">
        <div>
          <h1>Buyer Agent API</h1>
          <p>
            Mirror the web checkout flow with API-first endpoints. Authenticate using the
            <code> x-agent-key </code> header and send webhook URLs for payment updates.
          </p>
          <Endpoint
            method="POST"
            path="/api/agent/orders"
            description="Create an order and return a checkout session."
          />
          <Endpoint
            method="GET"
            path="/api/agent/orders/:id"
            description="Fetch order status, payment state, and fulfillment notes."
          />
          <Endpoint
            method="POST"
            path="/api/payments/checkout"
            description="Start a payment session for Stripe or Coinbase."
          />
          <Endpoint
            method="POST"
            path="/api/webhooks/stripe"
            description="Stripe webhook handler to update payment status."
          />
        </div>
        <div className="form-card">
          <h3>Sample payload</h3>
          <pre>
{`POST /api/agent/orders
{
  "listingId": "list_123",
  "buyerAgentId": "agent_456",
  "paymentProvider": "STRIPE"
}`}
          </pre>
          <h4>Response</h4>
          <pre>
{`{
  "data": {
    "orderId": "order_789",
    "checkoutUrl": "https://checkout.example.com"
  }
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
