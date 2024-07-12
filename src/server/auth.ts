/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type User as PrismaUser } from "@prisma/client";
import { randomBytes, randomInt, randomUUID } from "crypto";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type Session,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";
import Stripe from "stripe";
import { env } from "~/env";

import { db } from "~/server/db";
import { type EmailDetails } from "~/utils/types";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: PrismaUser;
  }
  //who cares
  interface User extends PrismaUser {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripeProductId?: string;
  }
}

export const authOptions = (emailDetails: EmailDetails): NextAuthOptions => {
  return {
    pages: {
      signIn: "/auth/signin",
      verifyRequest: "/auth/verify-request",
      error: "/auth/error",
      newUser: "/auth/new-user",
    },
    callbacks: {
      session: ({ session, user }) => ({
        ...session,
        user: {
          ...session.user,
          id: user.id,
          stripeCustomerId: user.stripeCustomerId,
          stripeProductId: user.stripeProductId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          stripeSubscriptionStatus: user.stripeSubscriptionStatus,
          commentsUsed: user.commentsUsed,
          personasUsed: user.personasUsed,
          memoryUsed: user.memoryUsed,
          resetAt: user.resetAt,
          isAdmin: user.isAdmin,
          isSpecial: user.isSpecial,
        },
        generateSessionToken: () => {
          return randomUUID?.() ?? randomBytes(32).toString("hex");
        },
      }),
    },
    events: {
      createUser: async ({ user }) => {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY_TEST, {
          apiVersion: "2024-06-20",
        });
        await stripe.customers
          .create({
            email: user.email!,
            name: user.name!,
          })
          .then(async (customer) => {
            return db.user.update({
              where: { id: user.id },
              data: {
                stripeCustomerId: customer.id,
              },
            });
          });
      },
    },
    adapter: PrismaAdapter(db) as Adapter,
    providers: [
      EmailProvider({
        server: {
          host: env.EMAIL_SERVER_HOST,
          port: Number(env.EMAIL_SERVER_PORT),
          auth: {
            user: env.EMAIL_SERVER_USER,
            pass: env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: env.VERIFICATION_EMAIL_FROM,
        generateVerificationToken() {
          return randomInt(100000, 999999).toString();
        },
        maxAge: 5 * 60,
        async sendVerificationRequest(params) {
          const { identifier: to, provider, token } = params;
          const { server, from } = provider;
          const { subject, text, body, code, goBack, safelyIgnore } =
            emailDetails;

          const result = await createTransport(server).sendMail({
            to,
            from,
            subject,
            text,
            html: `<body style="font-family: sans-serif; background: linear-gradient(to bottom, #cce3f1, #F3F6F6) no-repeat; background-size: cover; color: #000; padding: 32px 16px; text-align: center;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.4); max-width: 360px; min-height: 360px; margin: auto; border-radius: 10px; vertical-align: middle; padding: 32px 0px;">
                      <tr>
                        <td align="center" style="font-size: 22px; color: #000; font-weight: 300; padding-bottom: 16px;">${body}</td>
                      </tr>
                      <tr>
                        <td align="center">
                          <table border="0" cellspacing="0" cellpadding="0" style="margin: auto;">
                          <tr>
                              <td align="center" style="border-radius: 5px; padding-bottom: 16px;">
                                <span style="font-size: 16px;">${code}</span>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="border-radius: 5px;">
                                <code style="font-size: 22px;">${token}</code>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="padding-top: 16px;">
                                <p style="font-size: 16px; color: #000;">${goBack}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size: 16px; line-height: 22px; color: #000; padding: 0px 16px; font-weight: 300;">
                        ${safelyIgnore}
                        </td>
                      </tr>
                    </table>
                  </body>`,
          });
          const failed = result.rejected.concat(result.pending).filter(Boolean);
          if (failed.length) {
            throw new Error(
              `Email(s) (${failed.join(", ")}) could not be sent`,
            );
          }
        },
      }),
    ],
  };
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async (): Promise<Session> =>
  getServerSession(
    authOptions(null as unknown as EmailDetails),
  ) as Promise<Session>;
