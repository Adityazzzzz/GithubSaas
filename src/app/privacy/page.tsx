export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-10">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">1. Introduction</h2>
            <p>
              GitBrain ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your information when you use our codebase intelligence platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> GitHub username, email address, and profile image.</li>
              <li><strong>Repository Data:</strong> When you connect a repository, we fetch code structure, file contents, and commit history to generate vector embeddings.</li>
              <li><strong>Usage Data:</strong> Logs of queries, search patterns, and system interactions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">3. How We Use Your Code</h2>
            <p>
              Your code is strictly used to generate semantic embeddings for the RAG (Retrieval-Augmented Generation) system. 
              <strong>We do not train public AI models on your private code.</strong> Your code embeddings are stored in isolated namespaces within our vector database (Pinecone/pgvector).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures (SOC2 Type II compliant infrastructure) to protect your data. Vector embeddings are encrypted at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">5. Contact Us</h2>
            <p>
              If you have questions about this policy, please contact us at <a href="mailto:adityasinghrajawat2004@gmail.com" className="text-blue-600 underline">adityasinghrajawat2004@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}