'use client'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { api } from "@/trpc/react" 
import { Info, Loader2, CheckCircle2 } from "lucide-react" // Added CheckCircle2
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
        <div className="max-w-3xl mx-auto p-4 space-y-8"> {/* Added container styling */}
            
            {/* 1. Credit Balance Section */}
            <div>
                <h1 className="text-3xl font-bold">Billing</h1>
                <p className="text-gray-500 mt-2">
                    Manage your credits and view your transaction history.
                </p>
            </div>

            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Available Balance</h2>
                <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-blue-600">
                        {user?.credits || 0}
                    </div>
                    <span className="text-gray-500">Credits</span>
                </div>
            </div>

            {/* 2. Buy Credits Section */}
            <div className="bg-white rounded-lg border p-6 shadow-sm space-y-6">
                <h2 className="text-lg font-semibold">Top Up Credits</h2>
                
                <div className="bg-blue-50 px-4 py-3 rounded-md border border-blue-200 text-blue-700 flex items-start gap-3">
                    <Info className="size-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium">Credit Usage</p>
                        <p>1 Credit = 1 File indexed. A typical repository needs ~100 credits.</p>
                    </div>
                </div>

                <div className="pt-4">
                    <Slider 
                        defaultValue={[100]} 
                        max={1000} 
                        min={10} 
                        step={10} 
                        onValueChange={value => setCreditsToBuy(value)} 
                        value={creditsToBuy} 
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>10 Credits</span>
                        <span>1000 Credits</span>
                    </div>
                </div>

                <Button onClick={handlePayment} disabled={loading || createOrder.isPending} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Buy {creditsToBuyAmount} Credits for ₹{price}
                </Button>
            </div>

            {/* 3. Transaction History Section (NEW) */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
                {isLoadingHistory ? (
                    <div className="flex justify-center p-4">
                         <Loader2 className="animate-spin text-gray-500" />
                    </div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Credits</th>
                                    <th scope="col" className="px-6 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions?.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center">
                                            No transactions yet.
                                        </td>
                                    </tr>
                                )}
                                {transactions?.map((tx:any) => (
                                    <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-green-600">
                                            +{tx.credits}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            ID: {tx.id.slice(-6)}
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