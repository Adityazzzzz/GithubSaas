import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db"; 

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!; // MAKE SURE THIS IS SET IN .ENV
    if (!signature) {
        return NextResponse.json({ message: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expectedSignature !== signature) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    
    if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const userId = payment.notes.userId;
        const creditsStr = payment.notes.credits;
        
        if (!userId || !creditsStr) {
            return NextResponse.json({ message: "Missing metadata" }, { status: 400 });
        }

        const credits = parseInt(creditsStr);
        const paymentId = payment.id;

        const existingTransaction = await db.razorpayTransaction.findUnique({
            where: { paymentId: paymentId } 
        })

        if (existingTransaction) {
            console.log(`Payment ${paymentId} already processed.`);
            return NextResponse.json({ message: "Already processed" }, { status: 200 });
        }

        try {
            await db.$transaction(async (tx) => {
                const check = await tx.razorpayTransaction.findUnique({ where: { paymentId }});
                if(check) return;

                await tx.razorpayTransaction.create({
                    data: {
                        userId: userId,
                        credits: credits,
                        paymentId: paymentId,
                        orderId: payment.order_id,
                    },
                });
                
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        credits: { increment: credits },
                    },
                });
            });
            console.log(`Credits added via Webhook for user ${userId}`);
        } 
        catch (error) {
            console.error("Error processing webhook:", error);
        }
    }
    return NextResponse.json({ status: "ok" }, { status: 200 });
}