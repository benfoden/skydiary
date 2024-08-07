import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getOrCreateStripeCustomerIdForUser } from "~/server/stripe/stripe-webhook-handlers";

function baseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:3000`;
}

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["plus", "premium"]),
        period: z.enum(["monthly", "yearly"]),
        locale: z.enum(["en", "ja"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, db } = ctx;

      try {
        const customerId = await getOrCreateStripeCustomerIdForUser({
          db,
          stripe,
          userId: session.user?.id,
        });

        if (!customerId) {
          console.error("Could not create customer");
          throw new Error("Could not create customer");
        }

        let price: string;
        if (input.period === "yearly" && input.plan === "plus") {
          price =
            env.PRICE_ID_PLUS_YEARLY !== "development"
              ? env.PRICE_ID_PLUS_YEARLY
              : env.PRICE_ID_PLUS_YEARLY_TEST;
        } else if (input.period === "monthly" && input.plan === "plus") {
          price =
            env.PRICE_ID_PLUS_MONTHLY !== "development"
              ? env.PRICE_ID_PLUS_MONTHLY
              : env.PRICE_ID_PLUS_MONTHLY_TEST;
        } else if (input.period === "yearly" && input.plan === "premium") {
          price =
            env.PRICE_ID_PREMIUM_YEARLY !== "development"
              ? env.PRICE_ID_PREMIUM_YEARLY
              : env.PRICE_ID_PREMIUM_YEARLY_TEST;
        } else if (input.period === "monthly" && input.plan === "premium") {
          price =
            env.PRICE_ID_PREMIUM_MONTHLY !== "development"
              ? env.PRICE_ID_PREMIUM_MONTHLY
              : env.PRICE_ID_PREMIUM_MONTHLY_TEST;
        } else {
          console.error("Invalid period or productId");
          throw new Error("Invalid period or productId");
        }

        const localeToCurrency: Record<string, string> = {
          ja: "jpy",
          en: "usd",
        };

        const checkoutSession = await stripe.checkout.sessions.create({
          customer: customerId,
          client_reference_id: session.user?.id,
          payment_method_types: ["card"],
          currency: localeToCurrency[input.locale],
          locale: input.locale,
          mode: "subscription",
          line_items: [
            {
              price,
              quantity: 1,
            },
          ],
          success_url: `${baseUrl()}/pricing?checkoutSuccess=true`,
          cancel_url: `${baseUrl()}/pricing?checkoutCanceled=true`,
          subscription_data: {
            metadata: {
              userId: session.user?.id,
            },
          },
        });

        if (checkoutSession) {
          return { checkoutUrl: checkoutSession.url };
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),
  createBillingPortalSession: protectedProcedure
    .input(
      z.object({
        locale: z.enum(["en", "ja"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, db } = ctx;
      if (!ctx.session.user) {
        throw new Error("Not logged in");
      }

      const customerId = await getOrCreateStripeCustomerIdForUser({
        db,
        stripe,
        userId: session.user?.id,
      });

      if (!customerId) {
        throw new Error("Could not find or create customer");
      }

      const stripeBillingPortalSession =
        await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${baseUrl()}/settings`,
          locale: input.locale,
        });

      if (!stripeBillingPortalSession) {
        throw new Error("Could not create billing portal session");
      }

      return { billingPortalUrl: stripeBillingPortalSession.url };
    }),

  getUserSubDetails: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx?.session?.user?.id) {
      throw new Error("User not available");
    }
    return await ctx.db.subscription.findFirst({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  getAllSubs: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.subscription.findMany();
  }),

  getSubBySubId: protectedProcedure
    .input(z.object({ subId: z.string() }))
    .query(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findFirst({
        where: {
          id: input.subId,
        },
      });

      if (!subscription) {
        console.error("Could not find subscription with id", input.subId);
        return null;
      }
      return subscription;
    }),

  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, db } = ctx;

      const subscription = await stripe.subscriptions.retrieve(input.subId);

      if (!subscription) {
        console.error("Could not find subscription with id", input.subId);
        return null;
      }

      const customerId = await getOrCreateStripeCustomerIdForUser({
        db,
        stripe,
        userId: session.user?.id,
      });

      if (!customerId) {
        console.error("Could not find or create customer");
        throw new Error("Could not find or create customer");
      }

      const stripeSubscription = await stripe.subscriptions.update(
        subscription.id,
        {
          cancel_at_period_end: true,
        },
      );

      if (!stripeSubscription) {
        console.error("Could not update subscription");
        throw new Error("Could not update subscription");
      }

      await db.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          currentPeriodStart: new Date(
            stripeSubscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(
            stripeSubscription.current_period_end * 1000,
          ),
          endedAt: stripeSubscription.ended_at
            ? new Date(stripeSubscription.ended_at * 1000)
            : null,
          cancelAt: stripeSubscription.cancel_at
            ? new Date(stripeSubscription.cancel_at * 1000)
            : null,
          canceledAt: stripeSubscription.canceled_at
            ? new Date(stripeSubscription.canceled_at * 1000)
            : null,
          trialStart: stripeSubscription.trial_start
            ? new Date(stripeSubscription.trial_start * 1000)
            : null,
          trialEnd: stripeSubscription.trial_end
            ? new Date(stripeSubscription.trial_end * 1000)
            : null,
        },
      });
    }),
});
