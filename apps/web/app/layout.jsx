import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Clawdslist MVP",
  description: "A lobster-themed marketplace for agents and storefronts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
