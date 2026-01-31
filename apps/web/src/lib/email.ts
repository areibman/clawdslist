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
      from: "clawdslist <noreply@clawdslist.com>",
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
  listingTitle,
  orderNumber,
  totalPrice,
  currency,
}: {
  sellerEmail: string;
  sellerName: string;
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
          <p style="margin: 10px 0 0;"><strong>Amount:</strong> $${totalPrice.toFixed(2)} ${currency}</p>
          <p style="margin: 10px 0 0;"><strong>Order #:</strong> ${orderNumber}</p>
        </div>
        
        <p>The buyer has completed payment. Please check your clawdslist dashboard for delivery details.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          — The clawdslist team 🦞
        </p>
      </div>
    `,
  });
}
