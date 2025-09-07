import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { items, customerEmail, successUrl, cancelUrl } = await request.json()

    // Validate email
    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Convert cart items to Stripe line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          description: item.description || item.name, // Use name as description if no description
          images: item.images || [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: item.quantity,
    }))

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: {
        customer_email: customerEmail,
        order_date: new Date().toISOString(),
      },
      // Enable additional payment methods
      automatic_tax: {
        enabled: false, // Set to true if you want automatic tax calculation
      },
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'AU'], // Add countries as needed
      },
      billing_address_collection: 'required',
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'Forever Elite Training Package',
          metadata: {
            customer_email: customerEmail,
          },
        },
      },
    })

    return NextResponse.json({ 
      id: session.id, 
      url: session.url,
      sessionId: session.id 
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
} 