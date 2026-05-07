import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4">
            Terms of <span className="text-blue-400">Service</span>
          </h1>
          <p className="text-gray-300/90 text-sm sm:text-base">Last Updated: December 7, 2025</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-left space-y-8 text-gray-300/90 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-3xl font-bold mb-6">VIBRACODE TERMS OF SERVICE</h2>
            <p className="mb-4">Kurdosoft LTD ("Company", "we", or "us"), owns and operates the VibraCode application. These Terms of Service govern your use of the Services.</p>
            <p className="mb-4 font-semibold text-yellow-400">ARBITRATION NOTICE AND CLASS ACTION WAIVER: Except for certain disputes described below, you agree that disputes will be resolved by binding individual arbitration and you waive your right to participate in a class action lawsuit.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">1. Changes to the Agreement</h2>
            <p>We reserve the right to revise and update this Agreement. Your continued use of the Services means you accept any changes.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p>The Services are intended solely for users who are 13 years of age or older.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">3. Services; Generative AI</h2>
            <p>The Services enable you to create mobile software applications ("Created Apps") without requiring you to code the Created Apps directly.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">4. User Accounts</h2>
            <p>You must register for an account to use certain Services. You are responsible for maintaining the confidentiality of your account credentials.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p>The Services and their original content, features, and functionality are owned by Kurdosoft LTD and are protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
            <p>THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND.</p>
          </section>
          <section>
            <h2 className="text-white text-2xl font-semibold mb-4">24. Contact Information</h2>
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
