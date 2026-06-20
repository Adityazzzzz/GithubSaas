/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/**
 * Authentication middleware - guarantees userId is a non-null string
 */
const isAuthenticated = t.middleware(async ({ next, ctx }) => {
  const user = await auth();
  if (!user?.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: { ...user, userId: user.userId }, // userId is guaranteed non-null
    },
  });
});

/**
 * Project membership middleware - verifies the user belongs to the project.
 * Must be used AFTER isAuthenticated.
 * Expects `projectId` in the input.
 */
export const verifyProjectMembership = t.middleware(async ({ next, ctx, getRawInput }) => {
  const rawInput = await getRawInput();
  const input = rawInput as Record<string, unknown> | null | undefined;
  const projectId = input?.projectId as string | undefined;

  if (!projectId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'projectId is required',
    });
  }

  const user = (ctx as any).user;
  if (!user?.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const membership = await db.userToProject.findUnique({
    where: {
      userId_projectId: {
        userId: user.userId,
        projectId,
      },
    },
  });

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this project',
    });
  }

  return next({ ctx });
});

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);
export const protectedProcedure = t.procedure.use(isAuthenticated);

/** Protected procedure that also verifies the user belongs to the project in the input */
export const projectProcedure = t.procedure
  .use(isAuthenticated)
  .use(verifyProjectMembership);
