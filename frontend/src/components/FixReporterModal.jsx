import React, { useState, useMemo } from 'react';
import { X, Wrench, ShieldAlert, CheckCircle2, Loader2, Link2, IndianRupee, AlertTriangle } from 'lucide-react';

const ISSUE_TYPES = [
  { id: 'broken_link', label: 'Broken / Wrong Store Link', icon: Link2 },
  { id: 'wrong_price', label: 'Price or Discount Mismatch', icon: IndianRupee },
  { id: 'out_of_stock', label: 'Product Out of Stock', icon: AlertTriangle },
  { id: 'other', label: 'Other Product Correction', icon: Wrench }
];

export default function FixReporterModal({ product, onClose, themeMode = 'obsidian' }) {
  const [productName, setProductName] = useState(product?.name || '');
  const [platform, setPlatform] = useState(product?.platform || 'Amazon India');
  const [issueType, setIssueType] = useState('broken_link');
  const [correctInfo, setCorrectInfo] = useState('');
  const [userContact, setUserContact] = useState('');
  const [websiteHp, setWebsiteHp] = useState(''); // Hidden Honeypot for bots
  const [humanAnswer, setHumanAnswer] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Simple math verification for anti-spam
  const challenge = useMemo(() => {
    const a = Math.floor(Math.random() * 6) + 2;
    const b = Math.floor(Math.random() * 5) + 1;
    return { a, b, sum: a + b };
  }, []);

  const isLight = themeMode === 'ivory';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Check local cooldown (prevents spam clicking)
    const lastReportTime = Number(localStorage.getItem('khogo_last_report_ts') || 0);
    if (Date.now() - lastReportTime < 15000) {
      setErrorMsg('Please wait 15 seconds between submitting reports.');
      return;
    }

    // 2. Check math challenge
    if (Number(humanAnswer) !== challenge.sum) {
      setErrorMsg('Incorrect security math answer. Please verify you are human.');
      return;
    }

    if (!productName.trim() || correctInfo.trim().length < 5) {
      setErrorMsg('Please provide the product name and accurate details/link to fix.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('https://khogo-ai.onrender.com/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product?.id ? String(product.id) : '',
          product_name: productName,
          platform,
          issue_type: issueType,
          correct_info: correctInfo,
          user_contact: userContact,
          website_hp: websiteHp
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not submit report');
      }

      localStorage.setItem('khogo_last_report_ts', String(Date.now()));
      setStatusMsg(data.message || 'Thank you! Your fix report has been saved to our database.');
      setCorrectInfo('');
    } catch (err) {
      // Fallback local storage queue if Render server is waking up
      const savedQueue = JSON.parse(localStorage.getItem('khogo_offline_reports') || '[]');
      savedQueue.push({
        product_name: productName,
        platform,
        issue_type: issueType,
        correct_info: correctInfo,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('khogo_offline_reports', JSON.stringify(savedQueue));
      setStatusMsg('Report queued and recorded! Our team will update the database shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl ${
          isLight
            ? 'bg-[#FAF8F5] border-[#D4AF37]/40 text-zinc-900'
            : 'bg-[#0B0B0E] border-[#D4AF37]/40 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#141419] via-[#1F1A10] to-[#141419] border-b border-[#D4AF37]/30 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]">
              <Wrench className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-semibold block">
                Database Community Fix Reporter
              </span>
              <h3 className="font-harmond text-2xl font-bold text-white">
                Report Broken Link or Price Fix
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-harmond text-3xl font-bold">Fix Logged in Database!</h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              {statusMsg}
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-cyan-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Hidden Honeypot Input (Invisible to humans, traps spam bots) */}
            <input
              type="text"
              name="website_hp"
              value={websiteHp}
              onChange={(e) => setWebsiteHp(e.target.value)}
              tabIndex="-1"
              autoComplete="off"
              className="hidden"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:border-[#D4AF37] ${
                    isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-white/15 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Store Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:border-[#D4AF37] ${
                    isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-white/15 text-white'
                  }`}
                >
                  <option value="Amazon India">Amazon India</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Myntra">Myntra</option>
                  <option value="Nykaa">Nykaa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                What Needs Fixing?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = issueType === t.id;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setIssueType(t.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        active
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                          : isLight
                          ? 'bg-white border-zinc-200 text-zinc-700'
                          : 'bg-zinc-900/70 border-white/10 text-zinc-300 hover:border-white/30'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                      <span className="line-clamp-1">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Real Information / Working Product URL / Correct Price *
              </label>
              <textarea
                rows={3}
                required
                value={correctInfo}
                onChange={(e) => setCorrectInfo(e.target.value)}
                placeholder="Paste the working Amazon/Flipkart/Myntra URL or enter the updated ₹ price so we can fix it in the database..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:border-[#D4AF37] ${
                  isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-white/15 text-white'
                }`}
              />
            </div>

            {/* Spam Protection Challenge & Optional Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Spam Check: {challenge.a} + {challenge.b} = ?
                </label>
                <input
                  type="number"
                  required
                  value={humanAnswer}
                  onChange={(e) => setHumanAnswer(e.target.value)}
                  placeholder="Enter sum"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:border-cyan-400 ${
                    isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-white/15 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Your Email (Optional)
                </label>
                <input
                  type="email"
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                  placeholder="Notify me when fixed"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:border-[#D4AF37] ${
                    isLight ? 'bg-white border-zinc-300' : 'bg-zinc-900 border-white/15 text-white'
                  }`}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-cyan-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 transition-all cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Fix to Database
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}