import Stripe from "stripe";
import { env } from "~/env";

export const stripe = new Stripe(
  env.STRIPE_SECRET_KEY !== "development"
    ? env.STRIPE_SECRET_KEY
    : env.STRIPE_SECRET_KEY_TEST,
  {
    apiVersion: "2024-06-20",
  },
);
