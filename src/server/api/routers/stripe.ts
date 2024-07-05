import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getOrCreateStripeCustomerIdForUser } from "~/server/stripe/stripe-webhook-handlers";
import { baseURL } from "~/utils/constants";

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({ period: z.enum(["monthly", "yearly"]) }))
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
        if (input.period === "yearly") {
          price = env.PRICE_ID_BASE_YEARLY_TEST ?? env.PRICE_ID_BASE_YEARLY;
        } else if (input.period === "monthly") {
          price = env.PRICE_ID_BASE_MONTHLY_TEST ?? env.PRICE_ID_BASE_MONTHLY;
        } else {
          console.error("Invalid period or productId");
          throw new Error("Invalid period or productId");
        }

        const checkoutSession = await stripe.checkout.sessions.create({
          customer: customerId,
          client_reference_id: session.user?.id,
          payment_method_types: ["card"],
          mode: "subscription",
          line_items: [
            {
              price,
              quantity: 1,
            },
          ],
          success_url: `${baseURL()}/upgrade?checkoutSuccess=true`,
          cancel_url: `${baseURL()}/upgrade?checkoutCanceled=true`,
          subscription_data: {
            metadata: {
              userId: session.user?.id,
            },
          },
        });

        if (!checkoutSession) {
          console.error("Could not create checkout session");
          throw new Error("Could not create checkout session");
        }

        return { checkoutUrl: checkoutSession.url };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, db } = ctx;

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
        return_url: `${baseURL()}/settings`,
      });

    if (!stripeBillingPortalSession) {
      throw new Error("Could not create billing portal session");
    }

    return { billingPortalUrl: stripeBillingPortalSession.url };
  }),
});
