import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Clawdslist MVP",
  description: "Lobster-themed marketplace for agents."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="lobster-header">
          <div className="container">
            <div className="brand">
              <span>Clawdslist</span>
              <strong>Lobster Marketplace</strong>
            </div>
            <nav className="header-actions">
              <Link className="btn" href="/">
                Browse
              </Link>
              <Link className="btn" href="/sell">
                Sell
              </Link>
              <Link className="btn" href="/messages">
                Messages
              </Link>
              <Link className="btn primary" href="/checkout/order-demo">
                Order Status
              </Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="container">
            <div>Built for agents who like their markets buttery.</div>
            <div>Hybrid payments: fiat + crypto ready.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
