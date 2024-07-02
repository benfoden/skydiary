/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { getServerAuthSession } from "~/server/auth";

// retrieves a Stripe customer id for a given user if it exists or creates a new one
export const getOrCreateStripeCustomerIdForUser = async ({
  stripe,
  userId,
  db,
}: {
  stripe: Stripe;
  userId: string;
  db: PrismaClient;
}) => {
  const session = await getServerAuthSession();

  if (!session?.user) throw new Error("User not found");

  const { user } = session;

  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // create a new customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    // use metadata to link this Stripe customer to internal user id
    metadata: {
      userId,
    },
  });

  // update with new customer id
  const updatedUser = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  if (updatedUser.stripeCustomerId) {
    return updatedUser.stripeCustomerId;
  }
};

export const handleInvoicePaid = async ({
  event,
  stripe,
  db,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  db: PrismaClient;
}) => {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription;
  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string,
  );
  const userId = subscription.metadata.userId;

  // update user with subscription data
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
    },
  });
};

export const handleSubscriptionCreatedOrUpdated = async ({
  event,
  db,
}: {
  event: Stripe.Event;
  db: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata.userId;

  // update user with subscription data
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
    },
  });
};

export const handleSubscriptionCanceled = async ({
  event,
  db,
}: {
  event: Stripe.Event;
  db: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata.userId;

  // remove subscription data from user
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: null,
    },
  });
};
