import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const paymentRouter = createTRPCRouter({
    // 1. Create an Order (User clicks "Buy Credits")
    createOrder: protectedProcedure
        .input(z.object({ credits: z.number().min(1) }))
        .mutation(async ({ ctx, input }) => {
            // Define your price here (e.g., 1 Credit = ₹1)
            // Razorpay expects amount in PAISAE (100 paise = 1 Rupee)
            const pricePerCreditInPaise = 100; // ₹1.00
            
            const options = {
                amount: input.credits * pricePerCreditInPaise, 
                currency: "INR",
                receipt: `receipt_${ctx.user.userId}-${Date.now()}`,
            };

            const order = await razorpay.orders.create(options);

            // Optional: Log order to DB here if you want a transaction history
            
            return { 
                orderId: order.id, 
                amount: order.amount,
                currency: order.currency 
            };
        }),

    // 2. Verify Payment (After user pays in the modal)
    verifyPayment: protectedProcedure
        .input(z.object({
            razorpay_order_id: z.string(),
            razorpay_payment_id: z.string(),
            razorpay_signature: z.string(),
            creditsToBuy: z.number(), // Pass this so we know how much to add
        }))
        .mutation(async ({ ctx, input }) => {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
            
            // Generate the expected signature using your Secret
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(body.toString())
                .digest("hex");

            const isAuthentic = expectedSignature === razorpay_signature;

            if (!isAuthentic) {
                throw new Error("Invalid Payment Signature");
            }

            await ctx.db.user.update({
                where: { id: ctx.user.userId! },
                data: {
                    credits: {
                        increment: input.creditsToBuy,
                    },
                },
            });

            return { success: true };
        }),
});