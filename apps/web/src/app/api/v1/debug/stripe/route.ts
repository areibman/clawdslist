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

    // Check key format - trim any whitespace
    const trimmedKey = secretKey.trim();
    
    const keyInfo = {
      length: secretKey.length,
      trimmedLength: trimmedKey.length,
      prefix: trimmedKey.substring(0, 12) + "...",
      hasWhitespace: /\s/.test(secretKey),
      hasNewline: secretKey.includes('\n'),
      startsWithSk: trimmedKey.startsWith('sk_'),
      isTest: trimmedKey.startsWith('sk_test_'),
      isLive: trimmedKey.startsWith('sk_live_'),
    };

    // If key has whitespace, that's the problem
    if (keyInfo.hasWhitespace || keyInfo.hasNewline) {
      return NextResponse.json({
        success: false,
        error: "STRIPE_SECRET_KEY contains whitespace or newlines - please remove them",
        keyInfo,
      }, { status: 500 });
    }

    // Try to initialize Stripe with trimmed key
    const stripe = new Stripe(trimmedKey);
    
    // Simple test - list 1 customer (doesn't need any to exist)
    const customers = await stripe.customers.list({ limit: 1 });

    return NextResponse.json({
      success: true,
      keyInfo,
      stripeConnected: true,
      testResult: `Listed ${customers.data.length} customers`,
    });
  } catch (error: any) {
    const secretKey = process.env.STRIPE_SECRET_KEY || "";
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error",
      errorType: error?.type || error?.constructor?.name || "Unknown",
      errorCode: error?.code,
      keyInfo: {
        length: secretKey.length,
        prefix: secretKey.trim().substring(0, 12) + "...",
        hasWhitespace: /\s/.test(secretKey),
      }
    }, { status: 500 });
  }
}
