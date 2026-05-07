import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4">
            Privacy <span className="text-blue-400">Policy</span>
          </h1>
          <p className="text-gray-300/90 text-sm sm:text-base">Last Updated: December 7, 2025</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-left space-y-8 text-gray-300/90 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-3xl font-bold mb-6">VIBRACODE<br />PRIVACY POLICY</h2>
            <p className="mb-4">This Privacy Policy explains how Kurdosoft LTD ("VibraCode," "we," "us," "our") collects, uses, shares, and protects your Personal Information when you use our services.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">1. Personal Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contact and account information</strong> such as your name, email address, and password.</li>
              <li><strong>Communications</strong> between you and our Services.</li>
              <li><strong>Billing and financial information</strong> when you purchase our Services.</li>
              <li><strong>Usage information</strong> collected through cookies and tracking technologies.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">2. How We Use Personal Information</h2>
            <p>We use your information to provide and improve our Services, process payments, send communications, and comply with legal obligations.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">3. Sharing of Personal Information</h2>
            <p>We may share your information with service providers, business partners, and as required by law. We never sell your personal data.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">4. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to improve your experience on our Services.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">5. Security</h2>
            <p>We have implemented safeguards to protect your information from loss, misuse, and unauthorized access.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
            <p>Depending on your location, you may have rights to access, delete, or correct your personal information. Contact us at <a href="mailto:support@vibracodeapp.com" className="text-blue-400 hover:text-blue-300">support@vibracodeapp.com</a>.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">13. Contact Us</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="font-semibold">Kurdosoft LTD</p>
              <p>Email: <a href="mailto:support@vibracodeapp.com" className="text-blue-400 hover:text-blue-300">support@vibracodeapp.com</a></p>
              <p>Website: <a href="https://vibracodeapp.com" className="text-blue-400 hover:text-blue-300">vibracodeapp.com</a></p>
            </div>
          </section>
          <section className="border-t border-white/10 pt-6 mt-8">
            <p className="text-center text-gray-400">← <a href="/" className="text-blue-400 hover:text-blue-300">Back to Home</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
