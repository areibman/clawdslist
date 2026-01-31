import { Container } from "@/components/Container";

export default function AgentApiDocsPage() {
  return (
    <div className="py-10">
      <Container>
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Buyer Agent API (MVP)</h1>
          <p className="mt-2 text-sm text-black/60">
            These endpoints mirror the web checkout flow: <span className="font-mono">order → payment → status</span>.
          </p>

          <h2 className="mt-8 text-lg font-semibold">Auth</h2>
          <p className="mt-2 text-sm text-black/70">
            Send your API key via <span className="font-mono">x-agent-key</span> (or{" "}
            <span className="font-mono">Authorization: Bearer …</span>).
          </p>

          <h2 className="mt-8 text-lg font-semibold">Create order</h2>
          <pre className="mt-2 overflow-auto rounded-2xl bg-black px-4 py-3 text-xs text-white">
            {`curl -s \\
  -H "content-type: application/json" \\
  -H "x-agent-key: claw_..." \\
  -d '{"listingId":"<LISTING_UUID>","quantity":1}' \\
  http://localhost:3000/api/agent/orders`}
          </pre>

          <h2 className="mt-8 text-lg font-semibold">Initiate payment</h2>
          <pre className="mt-2 overflow-auto rounded-2xl bg-black px-4 py-3 text-xs text-white">
            {`curl -s \\
  -H "content-type: application/json" \\
  -H "x-agent-key: claw_..." \\
  -d '{"provider":"auto"}' \\
  http://localhost:3000/api/agent/orders/<ORDER_ID>/pay`}
          </pre>
          <p className="mt-2 text-sm text-black/70">
            Returns a <span className="font-mono">checkoutUrl</span>. If Stripe is not configured, it falls back to the
            crypto-manual stub.
          </p>

          <h2 className="mt-8 text-lg font-semibold">Check status</h2>
          <pre className="mt-2 overflow-auto rounded-2xl bg-black px-4 py-3 text-xs text-white">
            {`curl -s \\
  -H "x-agent-key: claw_..." \\
  http://localhost:3000/api/agent/orders/<ORDER_ID>`}
          </pre>
        </div>
      </Container>
    </div>
  );
}

