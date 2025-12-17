import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const paymentRouter = createTRPCRouter({
    createOrder: protectedProcedure
        .input(z.object({ credits: z.number().min(1) }))
        .mutation(async ({ ctx, input }) => {
            console.log("🟢 [1] createOrder started. Credits:", input.credits);
            
            const pricePerCreditInPaise = 799; 
            const amount = Math.round(input.credits * pricePerCreditInPaise);
            
            console.log("🟢 [2] Amount calculated:", amount);

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
                console.log("🟢 [3] Sending request to Razorpay...");
                const order = await razorpay.orders.create(options);
                console.log("🟢 [4] Order created successfully:", order.id);
                
                return { 
                    orderId: order.id, 
                    amount: order.amount,
                    currency: order.currency 
                };
            } catch (error) {
                console.error("🔴 [ERROR] Razorpay Failed:", error);
                // Throwing a clearer error for the frontend
                throw new Error("Razorpay Order Creation Failed: " + (error as any).message);
            }
        }),

    verifyPayment: protectedProcedure
        .input(z.object({
            razorpay_order_id: z.string(),
            razorpay_payment_id: z.string(),
            razorpay_signature: z.string(),
            creditsToBuy: z.number(), 
        }))
        .mutation(async ({ ctx, input }) => {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

            // 1. Validate Signature
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                throw new Error("Invalid Payment Signature");
            }

            // ✅ FIX 2: Double-Spending Protection (Transaction)
            await ctx.db.$transaction(async (tx) => {
                // Check if we already processed this payment
                const existing = await tx.razorpayTransaction.findUnique({
                    where: { paymentId: razorpay_payment_id }
                });

                if (existing) return; // Stop if already processed

                // Save transaction
                await tx.razorpayTransaction.create({
                    data: {
                        userId: ctx.user.userId!,
                        paymentId: razorpay_payment_id,
                        orderId: razorpay_order_id,
                        credits: input.creditsToBuy
                    }
                });

                // Add credits
                await tx.user.update({
                    where: { id: ctx.user.userId! },
                    data: {
                        credits: { increment: input.creditsToBuy },
                    },
                });
            });

            return { success: true };
        }),
});