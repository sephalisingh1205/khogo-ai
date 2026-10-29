import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';

export default function CookieConsentBanner({ onOpenPrivacy }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('khogo_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (choice) => {
    localStorage.setItem('khogo_cookie_consent', choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 animate-fadeIn">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0B0F]/95 backdrop-blur-2xl border border-[#D4AF37]/50 shadow-2xl text-zinc-100 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-harmond text-xl font-bold text-white flex items-center gap-1.5">
              Luxury Cookie & Privacy Preferences
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
              We use local storage & essential cookies to save your Wishlist, Price Alerts, and spam-protection session. Read our{' '}
              <button
                onClick={onOpenPrivacy}
                className="text-[#D4AF37] underline hover:text-cyan-300 cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={() => handleConsent('essential_only')}
            className="px-3.5 py-2 rounded-xl border border-white/15 bg-zinc-900 hover:border-white/30 text-xs font-semibold text-zinc-300 cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleConsent('accepted_all')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-cyan-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Accept All
          </button>
        </div>
      </div>
    </div>
  );
}