"use client";

import { useState } from "react";

const initialListing = {
  title: "",
  description: "",
  priceCents: 0,
  currency: "USD",
  categoryId: "",
  storefrontId: ""
};

const initialIngestion = {
  name: "",
  sourceUrl: "",
  agentId: "agent-shell"
};

export default function SellForm() {
  const [listing, setListing] = useState(initialListing);
  const [ingestion, setIngestion] = useState(initialIngestion);
  const [message, setMessage] = useState("");

  const submitListing = async () => {
    setMessage("Saving listing...");
    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...listing,
        priceCents: Number(listing.priceCents)
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Unable to save listing.");
      return;
    }
    setMessage(`Listing created: ${data.listing.title}`);
    setListing(initialListing);
  };

  const submitIngestion = async () => {
    setMessage("Enqueuing ingestion...");
    const response = await fetch("/api/storefronts/from-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingestion)
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Unable to enqueue ingestion.");
      return;
    }
    setMessage(`Ingestion queued for ${data.storefront.name}`);
    setIngestion(initialIngestion);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section className="card">
        <h2>Direct listing upload</h2>
        <div className="form-grid">
          <div>
            <label>
              Title
              <input
                value={listing.title}
                onChange={(event) =>
                  setListing({ ...listing, title: event.target.value })
                }
                placeholder="Lobster bot concierge"
              />
            </label>
          </div>
          <div>
            <label>
              Price (cents)
              <input
                type="number"
                value={listing.priceCents}
                onChange={(event) =>
                  setListing({
                    ...listing,
                    priceCents: Number(event.target.value)
                  })
                }
              />
            </label>
          </div>
          <div>
            <label>
              Currency
              <select
                value={listing.currency}
                onChange={(event) =>
                  setListing({ ...listing, currency: event.target.value })
                }
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Category ID
              <input
                value={listing.categoryId}
                onChange={(event) =>
                  setListing({ ...listing, categoryId: event.target.value })
                }
                placeholder="cat-digital-services"
              />
            </label>
          </div>
        </div>
        <label>
          Description
          <textarea
            value={listing.description}
            onChange={(event) =>
              setListing({ ...listing, description: event.target.value })
            }
            placeholder="Describe the value, delivery, and fulfillment."
          />
        </label>
        <button className="btn primary" type="button" onClick={submitListing}>
          Publish listing
        </button>
      </section>

      <section className="card">
        <h2>Ingest a storefront URL</h2>
        <div className="form-grid">
          <div>
            <label>
              Storefront name
              <input
                value={ingestion.name}
                onChange={(event) =>
                  setIngestion({ ...ingestion, name: event.target.value })
                }
                placeholder="Agent Supply Co."
              />
            </label>
          </div>
          <div>
            <label>
              Source URL
              <input
                value={ingestion.sourceUrl}
                onChange={(event) =>
                  setIngestion({ ...ingestion, sourceUrl: event.target.value })
                }
                placeholder="https://agent-storefront.example"
              />
            </label>
          </div>
          <div>
            <label>
              Agent ID
              <input
                value={ingestion.agentId}
                onChange={(event) =>
                  setIngestion({ ...ingestion, agentId: event.target.value })
                }
              />
            </label>
          </div>
        </div>
        <button className="btn primary" type="button" onClick={submitIngestion}>
          Queue ingestion
        </button>
      </section>

      {message && <div className="notice">{message}</div>}
    </div>
  );
}
