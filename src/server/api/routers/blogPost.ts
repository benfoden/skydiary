import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { stringToUrlStub } from "~/utils/text";

export const blogPostRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({ content: z.string(), title: z.string(), tag: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.create({
        data: {
          content: input.content,
          title: input.title,
          tag: input.tag,
          createdBy: {
            connect: {
              id: ctx.session.user.id,
              isAdmin: ctx.session.user.isAdmin,
            },
          },
          urlStub: stringToUrlStub(input.title),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        tag: z.string().optional(),
        isDraft: z.boolean().optional(),
        urlStub: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: {
        content?: string;
        title?: string;
        description?: string;
        tag?: string;
        isDraft?: boolean;
        urlStub?: string;
      } = {
        content: input.content,
        title: input.title,
        description: input.description,
        tag: input.tag,
        isDraft: input.isDraft,
      };

      if (input.title) {
        updateData.urlStub = stringToUrlStub(input.title);
      }

      return ctx.db.blogPost.update({
        where: {
          id: input.postId,
          createdBy: {
            id: ctx.session.user.id,
            isAdmin: ctx.session.user.isAdmin,
          },
        },
        data: updateData,
      });
    }),

  getByPostId: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blogPost.findFirst({
        where: {
          id: input.postId,
        },
      });
    }),

  getByUrlStub: publicProcedure
    .input(z.object({ urlStub: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blogPost.findFirst({
        where: {
          urlStub: input.urlStub,
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.blogPost.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllByTag: publicProcedure
    .input(z.object({ tag: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.blogPost.findMany({
        where: {
          tag: input.tag,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getLatestAnnouncement: publicProcedure.query(({ ctx }) => {
    return ctx.db.blogPost.findFirst({
      where: {
        tag: "announcement",
        isDraft: false,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.blogPost.delete({
        where: {
          id: input.postId,
          createdBy: {
            id: ctx.session.user.id,
            isAdmin: ctx.session.user.isAdmin,
          },
        },
      });
    }),
});
