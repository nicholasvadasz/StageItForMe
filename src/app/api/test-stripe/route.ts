import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICING_PLANS } from '@/lib/stripe';

export async function GET() {
  try {
    // Test Stripe connection by retrieving account info
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      success: true,
      stripe_connected: true,
      account_id: account.id,
      country: account.country,
      currency: account.default_currency,
      pricing_plans: Object.keys(PRICING_PLANS),
      test_mode: !account.details_submitted
    });

  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Stripe connection failed',
      success: false
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, name } = await request.json();

    if (action === 'create_customer') {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          test_customer: 'true'
        }
      });

      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          created: customer.created
        }
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('Stripe POST error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Stripe operation failed'
    }, { status: 500 });
  }
}