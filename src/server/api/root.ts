import { commentRouter } from "~/server/api/routers/comment";
import { postRouter } from "~/server/api/routers/post";
import { tagRouter } from "~/server/api/routers/tag";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { blogPostRouter } from "./routers/blogPost";
import { eventRouter } from "./routers/event";
import { personaRouter } from "./routers/persona";
import { stripeRouter } from "./routers/stripe";
import { userRouter } from "./routers/user";
import { userPromptRouter } from "./routers/userPrompt";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  persona: personaRouter,
  comment: commentRouter,
  tag: tagRouter,
  user: userRouter,
  stripe: stripeRouter,
  blogPost: blogPostRouter,
  event: eventRouter,
  userPrompt: userPromptRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
