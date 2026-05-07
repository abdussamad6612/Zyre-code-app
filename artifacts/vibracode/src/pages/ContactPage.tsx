import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900" />
      <div className="relative z-10 max-w-3xl w-full mx-auto px-4 py-24 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Mail className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-white text-3xl sm:text-5xl font-semibold tracking-tight mb-4">
            Contact <span className="text-blue-400">Us</span>
          </h1>
          <p className="text-gray-300/90 text-sm sm:text-base">
            Looking for a job? Email us and let's build something amazing together.
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-white text-2xl font-semibold mb-6">Email Us</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">hello@vibracodeapp.com</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">jobs@vibracodeapp.com</span>
            </div>
          </div>
          <p className="text-gray-300/70 text-sm mt-6">We'll get back to you within 24 hours</p>
        </div>
      </div>
    </div>
  );
}
