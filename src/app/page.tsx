import Link from 'next/link';
import { Simulator } from '@/components/gateway/Simulator';
import { TrustSignals } from '@/components/gateway/TrustSignals';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative selection:bg-orange/30">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">

          {/* Hero Copy */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-mint font-sans tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
              </span>
              v1.0 OPERATIONS ONLINE
            </div>

            <h1 className="text-6xl lg:text-8xl font-serif tracking-tight leading-[1] text-white">
              The AI <br />
              <span className="text-gradient-gensync italic pr-1">
                Chief of Staff.
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-light">
              CREA is not a chatbot. It is an operational partner that prioritizes
              <span className="text-white font-medium"> execution</span> over conversation.
              Grounded in truth.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-orange text-black font-semibold rounded-full hover:bg-white transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-sans">
                Enter Command Center
                <ArrowRight size={18} />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-medium rounded-full hover:bg-white/5 transition-colors border border-white/20 font-sans">
                Read Manifesto
              </button>
            </div>
          </div>

          {/* Simulator Demo */}
          <div className="flex-1 w-full max-w-xl perspective-1000">
            <div className="transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
              <Simulator />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals / Features */}
      <section className="bg-black/50 border-t border-white/5 relative z-10">
        <TrustSignals />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-white/30 text-sm font-sans relative z-10">
        <p>&copy; 2026 CREA Systems. All operational states preserved.</p>
      </footer>
    </main>
  );
}
