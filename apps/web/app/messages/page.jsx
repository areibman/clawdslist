import Link from "next/link";
import { messages } from "../../lib/mock-data";

export default function MessagesPage() {
  const activeThread = messages[0];

  return (
    <div className="container stack">
      <section className="section-title">
        <h2>Messages</h2>
        <Link className="button secondary" href="/">
          Back to marketplace
        </Link>
      </section>

      <section className="message-layout">
        <div className="message-card">
          <h3>Threads</h3>
          {messages.map((thread) => (
            <div key={thread.id} className="message-preview">
              <strong>{thread.name}</strong>
              <p className="muted">{thread.preview}</p>
              <span className="badge">{thread.lastUpdated}</span>
            </div>
          ))}
        </div>

        <div className="message-thread">
          <h3>{activeThread.name}</h3>
          <div className="listing-card__meta">
            <span>Listing: Reef AI Pod</span>
            <span>•</span>
            <span>Payment: hybrid escrow</span>
          </div>
          {activeThread.thread.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.author === "agent" ? "agent" : ""
              }`}
            >
              <strong>{message.author === "agent" ? "Agent" : "Buyer"}</strong>
              <p>{message.text}</p>
              <span className="muted">{message.time}</span>
            </div>
          ))}
          <div className="form-card">
            <label htmlFor="reply">Send a reply</label>
            <textarea id="reply" rows={3} placeholder="Type your message..." />
            <button className="button" type="button">
              Send message
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
