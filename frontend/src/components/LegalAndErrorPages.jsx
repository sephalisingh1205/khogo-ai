import React from 'react';
import { Shield, FileText, Compass, ArrowLeft, Lock, CheckCircle, Wrench } from 'lucide-react';

export function PrivacyPolicyPage({ onBack, themeMode }) {
  const isLight = themeMode === 'ivory';
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Khogo AI Storefront
      </button>

      <div
        className={`p-6 sm:p-10 rounded-3xl border space-y-6 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-[#0C0C10] border-[#D4AF37]/30 text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-[#D4AF37]/20 pb-5">
          <Shield className="w-8 h-8 text-[#D4AF37]" />
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
              Updated October 2026 • DPDP Act Compliant (India)
            </span>
            <h1 className="font-harmond text-3xl sm:text-5xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          <h2 className="font-harmond text-2xl font-bold text-[#D4AF37]">1. Zero-PII Local-First Architecture</h2>
          <p>
            Khogo AI is designed with privacy at its core. Your <strong>Wishlist</strong>, <strong>Theme Preferences</strong>, and <strong>Price Drop Alerts</strong> are stored locally on your device using encrypted browser storage (<code>localStorage</code>). We never sell or rent your personal shopping history to third-party advertisers.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          <h2 className="font-harmond text-2xl font-bold text-[#D4AF37]">2. AI Concierge & Spam Protection</h2>
          <p>
            When you interact with the Khogo AI Concierge or submit a Database Fix Report, your query is processed via our secure FastAPI backend and Groq open-source language models to recommend relevant products. Automated IP rate-limiting and honeypot shields protect the service against bot spam.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          <h2 className="font-harmond text-2xl font-bold text-[#D4AF37]">3. External Marketplace Redirects</h2>
          <p>
            Clicking "Buy Now" uses our real-time link resolver to redirect you to verified listings on <strong>Amazon India, Flipkart, Myntra, or Nykaa</strong>. Once redirected, your purchase is governed by the respective marketplace’s privacy and security policies.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          <h2 className="font-harmond text-2xl font-bold text-[#D4AF37]">4. Cookie Consent & Analytics</h2>
          <p>
            We use essential functional cookies to remember your cookie consent, theme mode (Obsidian Gold / Sterling Silver / Ivory Luxe), and saved items. You can reset or clear these at any time from your browser settings.
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsAndConditionsPage({ onBack, themeMode }) {
  const isLight = themeMode === 'ivory';
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Khogo AI Storefront
      </button>

      <div
        className={`p-6 sm:p-10 rounded-3xl border space-y-6 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-800' : 'bg-[#0C0C10] border-[#D4AF37]/30 text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-[#D4AF37]/20 pb-5">
          <FileText className="w-8 h-8 text-[#D4AF37]" />
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
              User Agreement & Marketplace Disclaimer
            </span>
            <h1 className="font-harmond text-3xl sm:text-5xl font-bold">Terms & Conditions</h1>
          </div>
        </div>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          <h2 className="font-harmond text-2xl font-bold text-[#D4AF37]">1. Price Comparison & Graph Accuracy</h2>
          <p>
            Khogo AI aggregates product pricing, Deal Scores, and historical price trajectories across major Indian e-commerce platforms. Because online store prices fluctuate rapidly during sales, the final checkout price on the destination store (Amazon India, Flipkart, Myntra, or Nykaa) shall always prevail.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          <h2 className="font-harmond text-2xl font-bold text-[#D4AF37]">2. Community Database Fix Reporter</h2>
          <p>
            Users may submit real product corrections, broken link alerts, or price updates via our Fix Reporter. By submitting a report, you confirm that the information is accurate and free of spam or malicious URLs. Abusive traffic is automatically throttled by our spam protection engine.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
          <h2 className="font-harmond text-2xl font-bold text-[#D4AF37]">3. Fulfilment, Returns & Warranty</h2>
          <p>
            Khogo AI operates as an AI discovery and price intelligence hub. Order billing, shipping, 7-day returns, and manufacturer warranties are fulfilled directly by the merchant platform where you complete your purchase.
          </p>
        </section>
      </div>
    </div>
  );
}

export function Custom404Page({ onBack, onOpenReporter }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-3xl mx-auto bg-gradient-to-tr from-purple-500/20 via-[#D4AF37]/20 to-cyan-400/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-2xl">
        <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-rose-500/15 text-rose-300 border border-rose-500/30">
        Error 404 • Vault Coordinates Not Found
      </span>

      <h1 className="font-harmond text-5xl sm:text-7xl font-bold">
        Lost in the <span className="italic text-[#D4AF37]">Luxury Vault.</span>
      </h1>

      <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
        The page, product route, or link you are looking for has moved or does not exist. Let’s get you back to live deals or report a broken link.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-cyan-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg"
        >
          Back to Live Catalog
        </button>

        <button
          onClick={onOpenReporter}
          className="px-5 py-3 rounded-xl border border-[#D4AF37]/40 bg-zinc-900 text-[#D4AF37] font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#D4AF37]/10 cursor-pointer"
        >
          <Wrench className="w-4 h-4" /> Report a Broken Link
        </button>
      </div>
    </div>
  );
}