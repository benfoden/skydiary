import type Stripe from "stripe";
import { env } from "~/env";
import { db } from "~/server/db";
import { stripe } from "~/server/stripe/client";
import {
  handleInvoicePaid,
  handleSubscriptionCreatedOrUpdated,
  handleSubscriptionDeleted,
} from "~/server/stripe/stripe-webhook-handlers";

// Stripe requires the raw body to construct the event.

const relevantEvents = new Set([
  "invoice.paid",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Stripe signature not found.", { status: 400 });
  }
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response("Webhook secret not found.", { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(`❌ Error message: ${err.message}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "invoice.paid":
          // Used to provision services after the trial has ended.
          // The status of the invoice will show up as paid. Store the status in your database to reference when a user accesses your service to avoid hitting rate limits.
          await handleInvoicePaid({
            event,
            stripe,
            db,
          });
          break;
        case "customer.subscription.created":
          await handleSubscriptionCreatedOrUpdated({
            event,
            db,
            isNew: true,
          });
          break;
        case "customer.subscription.updated":
          await handleSubscriptionCreatedOrUpdated({
            event,
            db,
            isNew: false,
          });
          break;

        case "customer.subscription.deleted":
          // handle subscription cancelled automatically based
          // upon your subscription settings.
          await handleSubscriptionDeleted({
            event,
            db,
          });
          break;
        default:
          throw new Error("Unhandled relevant event!");
      }
    } catch (error) {
      console.log(error);
      return new Response(
        "Webhook handler failed. View Next.js function logs.",
        {
          status: 400,
        },
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400,
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
