'use client'

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { api } from "@/trpc/react"
import { Info, Loader2, CheckCircle2, CreditCard } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

const BillingPage = () => {
    // 1. Fetch user credits AND history
    const { data: user, refetch } = api.project.getMyCredits.useQuery()
    const { data: transactions, isLoading: isLoadingHistory } = api.payments.getCreditsHistory.useQuery()

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
                name: "GitBrain-AI Studio",
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
                theme: { color: "#3399cc" },
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
        <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Manage your billing information and credit usage.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                
                {/* 1. Balance Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between h-full">
                    <div>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <CreditCard className="size-5 text-primary" />
                            Current Balance
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Your available credits for indexing repositories.
                        </p>
                    </div>
                    <div className="mt-6">
                        <div className="text-5xl font-bold tracking-tight">
                            {user?.credits || 0}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Available Credits
                        </p>
                    </div>
                </div>

                {/* 2. Purchase Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col h-full">
                    <h2 className="font-semibold text-lg mb-4">Top Up Credits</h2>
                    
                    <div className="flex-1 space-y-6">
                        <div className="bg-secondary/50 px-4 py-3 rounded-lg border border-secondary text-secondary-foreground flex items-start gap-3">
                            <Info className="size-5 shrink-0 mt-0.5 text-blue-500" />
                            <div className="text-sm">
                                <p className="font-medium">Credit Usage</p>
                                <p className="text-muted-foreground">1 Credit = 1 File indexed. A typical repository needs ~100 credits.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between font-medium">
                                <span>Buy Credits</span>
                                <span>{creditsToBuyAmount}</span>
                            </div>
                            <Slider
                                defaultValue={[100]}
                                max={1000}
                                min={10}
                                step={10}
                                onValueChange={value => setCreditsToBuy(value)}
                                value={creditsToBuy}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>10 Credits</span>
                                <span>1000 Credits</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button 
                            onClick={handlePayment} 
                            disabled={loading || createOrder.isPending} 
                            className="w-full text-md py-6 shadow-md"
                            size="lg"
                        >
                            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Buy {creditsToBuyAmount} Credits for ₹{price}
                        </Button>
                    </div>
                </div>
            </div>

            {/* 3. Transaction History */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold">Transaction History</h2>
                    <p className="text-sm text-muted-foreground">View your recent purchases and top-ups.</p>
                </div>
                
                {isLoadingHistory ? (
                    <div className="flex justify-center p-12">
                         <Loader2 className="animate-spin size-8 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Credits</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transactions?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                            No transactions yet.
                                        </td>
                                    </tr>
                                )}
                                {transactions?.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-foreground">
                                            {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs">
                                                +{tx.credits} Credits
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <CheckCircle2 className="size-4 text-green-500" />
                                                <span>Successful</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                            {tx.id}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BillingPage