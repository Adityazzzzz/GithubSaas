export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Refund & Cancellation Policy</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">1. Subscription Cancellation</h2>
            <p>
              You may cancel your GitBrain subscription at any time from your dashboard settings. Upon cancellation, your access will continue until the end of the current billing cycle. No further charges will be applied.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">2. Refund Policy</h2>
            <p>
              Since GitBrain offers immediate access to digital cloud resources (GPU processing for vectorization), we generally do not offer refunds once the service has been used (e.g., a repository has been indexed).
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Exceptions:</strong> If you were charged due to a technical error, or if you have not used any credits/indexing within 7 days of purchase, you may request a full refund.</li>
              <li><strong>To Request:</strong> Email <a href="mailto:adityasinghrajawat2004@gmail.com" className="text-blue-600 underline">adityasinghrajawat2004@gmail.com</a> with your transaction ID.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">3. Processing Time</h2>
            <p>
              Approved refunds are processed within 5-7 business days and will be returned to the original payment method.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}