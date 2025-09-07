import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export const PRICING_PLANS = {
  starter: {
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      "10 photos per month",
      "Basic staging furniture",
      "Standard resolution output",
      "Email support"
    ],
    limits: {
      photosPerMonth: 10,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    }
  },
  professional: {
    name: "Professional",
    price: 79,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    features: [
      "50 photos per month",
      "Premium staging furniture",
      "High resolution output",
      "Priority email support",
      "Bulk processing"
    ],
    limits: {
      photosPerMonth: 50,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    }
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      "Unlimited photos",
      "Premium + custom furniture",
      "4K resolution output",
      "Phone & email support",
      "API access",
      "Custom branding"
    ],
    limits: {
      photosPerMonth: -1, // unlimited
      maxFileSize: 100 * 1024 * 1024, // 100MB
    }
  }
};

export async function createCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createSubscription(customerId: string, priceId: string) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}