import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const paymentRouter = createTRPCRouter({
    // 1. Create Order
    createOrder: protectedProcedure
        .input(z.object({ credits: z.number().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const pricePerCreditInPaise = 799; 
            const amount = Math.round(input.credits * pricePerCreditInPaise);
            
            const options = {
                amount: amount, 
                currency: "INR",
                receipt: `r_${Date.now()}_${ctx.user.userId!.slice(-5)}`,
                notes: {
                    userId: ctx.user.userId!,
                    credits: input.credits.toString()
                }
            };

            try {
                const order = await razorpay.orders.create(options);
                return { 
                    orderId: order.id, 
                    amount: order.amount,
                    currency: order.currency 
                };
            } catch (error) {
                console.error("Razorpay Error:", error);
                throw new Error("Razorpay Order Creation Failed");
            }
        }),

    // 2. Verify Payment
    verifyPayment: protectedProcedure
        .input(z.object({
            razorpay_order_id: z.string(),
            razorpay_payment_id: z.string(),
            razorpay_signature: z.string(),
            creditsToBuy: z.number(), 
        }))
        .mutation(async ({ ctx, input }) => {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                throw new Error("Invalid Payment Signature");
            }

            await ctx.db.$transaction(async (tx) => {
                const existing = await tx.razorpayTransaction.findUnique({
                    where: { paymentId: razorpay_payment_id }
                });

                if (existing) return; 

                await tx.razorpayTransaction.create({
                    data: {
                        userId: ctx.user.userId!,
                        paymentId: razorpay_payment_id,
                        orderId: razorpay_order_id,
                        credits: input.creditsToBuy
                    }
                });

                await tx.user.update({
                    where: { id: ctx.user.userId! },
                    data: {
                        credits: { increment: input.creditsToBuy },
                    },
                });
            });

            return { success: true };
        }),

    // 3. Get History (THIS WAS MISSING)
    getCreditsHistory: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.razorpayTransaction.findMany({
            where: { userId: ctx.user.userId! },
            orderBy: { createdAt: 'desc' },
        });
    }),
});