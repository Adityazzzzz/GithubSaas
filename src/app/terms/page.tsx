export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Terms & Conditions</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using GitBrain, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">2. AI Limitations</h2>
            <p>
              GitBrain uses Artificial Intelligence to analyze code. While we strive for accuracy, AI models can hallucinate or provide incorrect explanations. You acknowledge that GitBrain is an assistive tool and you are responsible for verifying any code or logic suggestions before implementation in production.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">3. Fair Use</h2>
            <p>
              You agree not to reverse engineer the platform, use the API for scraping, or attempt to bypass rate limits. We reserve the right to terminate accounts found abusing the system resources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">4. Governing Law</h2>
            <p>
              These Terms shall be governed by and defined following the laws of India. GitBrain and yourself irrevocably consent that the courts of Bhopal, Madhya Pradesh shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">5. Contact</h2>
            <p>
              For legal inquiries, email <a href="mailto:adityasinghrajawat2004@gmail.com" className="text-blue-600 underline">adityasinghrajawat2004@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}