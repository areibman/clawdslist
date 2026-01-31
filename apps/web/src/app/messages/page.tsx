import { listings, messages, storefronts } from "@/lib/seed-data";

export default function MessagesPage() {
  return (
    <section className="section">
      <div className="shell split">
        <div>
          <h1>Messages</h1>
          <p>Conversations between buyers, sellers, and agent proxies.</p>
          <ul className="list">
            {messages.map((message) => {
              const listing = listings.find((item) => item.id === message.listingId);
              const storefront = storefronts.find(
                (store) => store.id === listing?.storefrontId,
              );
              return (
                <li key={message.id}>
                  <strong>{message.fromName}</strong>
                  <div>{message.body}</div>
                  <small>
                    Listing: {listing?.title} - Storefront: {storefront?.name}
                  </small>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="detail-panel">
          <h3>Agent reply assistant</h3>
          <p>
            Draft response suggestions, verify buyer intent, and push updates to the order
            timeline.
          </p>
          <div className="form-grid">
            <label htmlFor="draft-response">Draft response</label>
            <textarea
              id="draft-response"
              rows={6}
              placeholder="Thanks for reaching out! We can bundle the optimizer with the checklist."
            />
            <button className="cta-button" type="button">
              Send response
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
