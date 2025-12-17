'use client'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { api } from "@/trpc/react" // <--- Use tRPC, not direct lib imports
import { Info, Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

const BillingPage = () => {
    const { data: user, refetch } = api.project.getMyCredits.useQuery()
    const createOrder = api.payments.createOrder.useMutation()
    const verifyPayment = api.payments.verifyPayment.useMutation()
    const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100])
    const creditsToBuyAmount = creditsToBuy[0]!

    const price = (creditsToBuyAmount * 7.99).toFixed(2)
    
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])
    const handlePayment = async () => {
        setLoading(true)
        try {
            const order = await createOrder.mutateAsync({ credits: creditsToBuyAmount })
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Dionysus AI",
                description: `Buy ${creditsToBuyAmount} Credits`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    try {
                        await verifyPayment.mutateAsync({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            creditsToBuy: creditsToBuyAmount
                        })
                        toast.success('Credits added successfully!')
                        refetch() 
                    } 
                    catch (err) {
                        console.error(err)
                        toast.error('Payment verification failed')
                    }
                },
                theme: {
                    color: "#3399cc",
                },
            }
            const rzp1 = new (window as any).Razorpay(options)
            rzp1.open()
            
        } 
        catch (error) {
            console.error(error)
            toast.error('Something went wrong during Payment initialization.')
        } 
        finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-xl font-semibold">Billing</h1>
            <div className="h-2" />
            <p className="text-sm text-gray-500">
                You currently have {user?.credits} credits.
            </p>
            <div className="h-2"></div>
            <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700 dark:border-gray-200 dark:text-gray-700">
                <div className="flex items-center gap-2">
                    <Info className="size-4" />
                    <p className="text-sm">
                        Each credit allows you to index 1 file in a repository.
                    </p>
                </div>
                <p className="text-sm">
                    E.g. If your project has 100 files, you will need 100 credits to index it.
                </p>
            </div>

            <div className="h-4"></div>

            <Slider 
                defaultValue={[100]} 
                max={1000} 
                min={10} 
                step={10} 
                onValueChange={value => setCreditsToBuy(value)} 
                value={creditsToBuy} 
            />
            <div className="h-4"></div>

            <Button onClick={handlePayment} disabled={loading || createOrder.isPending}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buy {creditsToBuyAmount} credits for ₹{price}
            </Button>
        </div>
    )
}

export default BillingPage