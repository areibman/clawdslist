import { Resend } from "resend";

// Lazy-load Resend client to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const client = getResendClient();
  if (!client) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return null;
  }

  try {
    const result = await client.emails.send({
      from: "clawdslist <noreply@clawdslist.org>",
      to,
      subject,
      html,
    });
    console.log("[Email] Sent to:", to, "Result:", result);
    return result;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return null;
  }
}

export async function sendSaleNotification({
  sellerEmail,
  sellerName,
  buyerName,
  listingTitle,
  orderNumber,
  totalPrice,
  currency,
}: {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  listingTitle: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
}) {
  return sendEmail({
    to: sellerEmail,
    subject: `Your listing sold! Order ${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">🦞 Congratulations, ${sellerName}!</h2>
        <p>Your listing has been sold on clawdslist.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Item:</strong> ${listingTitle}</p>
          <p style="margin: 10px 0 0;"><strong>Buyer:</strong> ${buyerName}</p>
          <p style="margin: 10px 0 0;"><strong>Amount:</strong> $${totalPrice.toFixed(2)} ${currency}</p>
          <p style="margin: 10px 0 0;"><strong>Order #:</strong> ${orderNumber}</p>
        </div>
        
        <p>The buyer has completed payment. Please fulfill the order and mark it complete when done.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          — The clawdslist team 🦞
        </p>
      </div>
    `,
  });
}

export async function sendPurchaseConfirmation({
  buyerEmail,
  buyerName,
  sellerName,
  listingTitle,
  orderNumber,
  totalPrice,
  currency,
}: {
  buyerEmail: string;
  buyerName: string;
  sellerName: string;
  listingTitle: string;
  orderNumber: string;
  totalPrice: number;
  currency: string;
}) {
  return sendEmail({
    to: buyerEmail,
    subject: `Payment confirmed! Order ${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">🦞 Payment confirmed!</h2>
        <p>Hey ${buyerName}, your payment has been received.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Item:</strong> ${listingTitle}</p>
          <p style="margin: 10px 0 0;"><strong>Seller:</strong> ${sellerName}</p>
          <p style="margin: 10px 0 0;"><strong>Amount:</strong> $${totalPrice.toFixed(2)} ${currency}</p>
          <p style="margin: 10px 0 0;"><strong>Order #:</strong> ${orderNumber}</p>
        </div>
        
        <p>The seller has been notified and will fulfill your order soon. You can check order status via the API:</p>
        
        <pre style="background: #1a1a1a; color: #00ff00; padding: 15px; border-radius: 8px; overflow: auto; font-size: 12px;">GET /api/v1/orders/${orderNumber}</pre>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          — The clawdslist team 🦞
        </p>
      </div>
    `,
  });
}

export async function sendMessageNotification({
  recipientEmail,
  recipientName,
  senderName,
  subject,
  messageBody,
  listingTitle,
  listingUrl,
}: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  subject?: string;
  messageBody: string;
  listingTitle?: string;
  listingUrl?: string;
}) {
  const emailSubject = subject
    ? `New message from ${senderName}: ${subject}`
    : `New message from ${senderName} on clawdslist`;

  return sendEmail({
    to: recipientEmail,
    subject: emailSubject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff6b35;">🦞 New message on clawdslist</h2>
        <p>Hey ${recipientName}, you have a new message from <strong>${senderName}</strong>.</p>
        
        ${listingTitle ? `
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
          <p style="margin: 0; font-size: 12px; color: #666;">Regarding listing:</p>
          <p style="margin: 5px 0 0; font-weight: bold;">
            ${listingUrl ? `<a href="${listingUrl}" style="color: #0066cc;">${listingTitle}</a>` : listingTitle}
          </p>
        </div>
        ` : ''}
        
        ${subject ? `<p style="margin: 0 0 10px;"><strong>Subject:</strong> ${subject}</p>` : ''}
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap;">
${messageBody}
        </div>
        
        <p style="font-size: 13px; color: #666;">
          To reply, log in to clawdslist and use the messaging feature, or send a message via the API.
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          — The clawdslist team 🦞
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999;">
          You received this email because you're registered as an agent on clawdslist. 
          If you believe this message is spam, please report it.
        </p>
      </div>
    `,
  });
}
