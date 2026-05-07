import { RotateCcw } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 pointer-events-none" />
      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 py-24 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <RotateCcw className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4">
            Refund <span className="text-blue-400">Policy</span>
          </h1>
          <p className="text-gray-300/90 text-sm sm:text-base">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-left">
          <div className="space-y-6 text-gray-300/90 text-sm">
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">1. Refund Eligibility</h2>
              <p>Refunds are available for subscription payments within 7 days of the initial purchase or renewal, provided the service has not been extensively used.</p>
            </section>
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">2. Refund Process</h2>
              <p>To request a refund, please contact our support team at hello@vibracodeapp.com with your account details and reason for the refund request.</p>
            </section>
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">3. Processing Time</h2>
              <p>Refund requests are typically processed within 5-10 business days. Refunds will be issued to the original payment method used for the purchase.</p>
            </section>
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">4. Non-Refundable Items</h2>
              <p>Credits consumed during usage, custom development services, and third-party integrations are generally non-refundable.</p>
            </section>
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">5. Partial Refunds</h2>
              <p>In certain circumstances, we may offer partial refunds based on usage patterns and the specific situation.</p>
            </section>
            <section>
              <h2 className="text-white text-xl font-semibold mb-3">6. Contact Information</h2>
              <p>For refund requests or questions about this policy, please contact us at hello@vibracodeapp.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
