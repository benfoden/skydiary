/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { ACTIVESTATUSES } from "~/utils/constants";

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

export const handleSubscriptionCreatedOrUpdated = async ({
  event,
  db,
  isNew,
}: {
  event: Stripe.Event;
  db: PrismaClient;
  isNew: boolean;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata.userId;
  if (!userId) throw new Error("User not found");
  if (!subscription.items?.data[0]?.price?.id)
    throw new Error("Price not found");

  // update user with subscription data
  try {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeSubscriptionStatus: subscription.status,
        stripeProductId:
          ACTIVESTATUSES.includes(subscription.status) &&
          subscription.items?.data?.[0]?.price?.product
            ? (subscription.items?.data?.[0]?.price?.product as string)
            : env.PRODUCT_ID_LITE,
      },
    });

    if (isNew) {
      await db.subscription.create({
        data: {
          id: subscription.id,
          userId: userId,
          status: subscription.status,
          metadata: JSON.stringify(subscription.metadata),
          priceId: subscription?.items?.data[0].price.id ?? "",
          quantity: subscription?.items?.data[0]?.quantity ?? 1,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null,
          cancelAt: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000)
            : null,
          canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          trialStart: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        },
      });
    } else {
      await db.subscription.update({
        where: {
          id: subscription.id,
          userId: userId,
        },
        data: {
          status: subscription.status,
          metadata: JSON.stringify(subscription.metadata),
          priceId: subscription?.items?.data[0].price.id ?? "",
          quantity: subscription?.items?.data[0]?.quantity ?? 1,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null,
          cancelAt: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000)
            : null,
          canceledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          trialStart: subscription.trial_start
            ? new Date(subscription.trial_start * 1000)
            : null,
          trialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null,
        },
      });
    }
  } catch (e) {
    console.error("stripe to sub update error", e);
  }
};

export const handleSubscriptionDeleted = async ({
  event,
  db,
}: {
  event: Stripe.Event;
  db: PrismaClient;
}) => {
  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata.userId;

  if (!userId) throw new Error("User not found");

  // remove subscription data from user
  await db.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: subscription.status,
      stripeProductId: env.PRODUCT_ID_LITE,
    },
  });

  await db.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      endedAt: subscription.ended_at
        ? new Date(subscription.ended_at * 1000)
        : null,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : null,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });
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
      stripeProductId:
        ACTIVESTATUSES.includes(subscription.status) &&
        subscription.items?.data?.[0]?.price?.product
          ? (subscription.items?.data?.[0]?.price?.product as string)
          : env.PRODUCT_ID_LITE,
    },
  });

  await db.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      endedAt: subscription.ended_at
        ? new Date(subscription.ended_at * 1000)
        : null,
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : null,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });
};
