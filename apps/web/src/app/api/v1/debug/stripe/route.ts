import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Debug endpoint to test Stripe connection
// DELETE THIS AFTER DEBUGGING
export async function GET(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      return NextResponse.json({ 
        error: "STRIPE_SECRET_KEY not set",
        keyExists: false 
      }, { status: 500 });
    }

    // Check key format
    const keyInfo = {
      length: secretKey.length,
      prefix: secretKey.substring(0, 8),
      hasWhitespace: /\s/.test(secretKey),
      hasNewline: /\n/.test(secretKey),
    };

    // Try to initialize Stripe and make a simple API call
    const stripe = new Stripe(secretKey);
    
    // Simple test - list 1 customer (doesn't need any to exist)
    const customers = await stripe.customers.list({ limit: 1 });

    return NextResponse.json({
      success: true,
      keyInfo,
      stripeConnected: true,
      testResult: `Listed ${customers.data.length} customers`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
    }, { status: 500 });
  }
}
