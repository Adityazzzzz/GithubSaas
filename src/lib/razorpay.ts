'use server'
import { auth } from '@clerk/nextjs/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { db } from '@/server/db' 

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createRazorpayOrder(credits: number) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')
        
    // 1 credit = ₹7.99 (799 paise)
    const amount = Math.round((credits) * 799)

    const options = {
        amount: amount.toString(),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
            userId: userId,
            credits: credits.toString() 
        }
    }

    const order = await razorpay.orders.create(options)
    return order
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
    credits: number
}) {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits } = data

    // 1. Validate Signature
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex')

    if (generated_signature !== razorpay_signature) {
        throw new Error('Invalid signature')
    }

    // 2. Check if already processed (Idempotency)
    const existingTransaction = await db.razorpayTransaction.findUnique({
        where: { paymentId: razorpay_payment_id } // Check by paymentId, not id
    })

    if (existingTransaction) {
        return { success: true, message: "Already processed" }
    }

    // 3. Process Transaction
    await db.$transaction(async (tx) => {
        // Double-check inside transaction to be safe
        const existing = await tx.razorpayTransaction.findUnique({
             where: { paymentId: razorpay_payment_id }
        })
        if(existing) return;

        await tx.razorpayTransaction.create({
            data:{
                userId,
                credits,
                paymentId: razorpay_payment_id, // Save these!
                orderId: razorpay_order_id,
            },
        })
        
        await tx.user.update({
            where: { id: userId },
            data: {
                credits: { increment: credits }
            },
        })
    })

    return { success: true }
}