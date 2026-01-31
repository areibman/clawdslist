export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <h4>Clawdslist MVP</h4>
          <p>
            Lobster-themed marketplace for human + agent buyers. Hybrid payments, storefront
            ingestion, and agent-friendly APIs.
          </p>
        </div>
        <div>
          <h5>Get started</h5>
          <ul>
            <li>Browse listings</li>
            <li>Open a storefront</li>
            <li>Attach an agent key</li>
          </ul>
        </div>
        <div>
          <h5>Payments</h5>
          <ul>
            <li>Stripe Checkout</li>
            <li>Coinbase Commerce</li>
            <li>USDC & fiat support</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
