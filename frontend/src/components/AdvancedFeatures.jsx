import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Trash2, CheckCircle, ExternalLink, Scale, Sparkles, Lock, Wrench } from 'lucide-react';

// 1. SIDE-BY-SIDE PRODUCT BATTLE MODAL
export function VersusModal({ selectedProducts, onClose, themeMode }) {
  if (!selectedProducts || selectedProducts.length < 2) return null;

  const [p1, p2] = selectedProducts;
  const isLight = themeMode === 'ivory';

  // AI Verdict computation
  const cheaper = p1.price_inr <= p2.price_inr ? p1 : p2;
  const betterRated = (p1.rating || 4) >= (p2.rating || 4) ? p1 : p2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-3xl rounded-3xl border overflow-hidden shadow-2xl ${
          isLight ? 'bg-[#FAF8F5] border-[#D4AF37]/40 text-zinc-900' : 'bg-[#0B0B0E] border-[#D4AF37]/40 text-zinc-100'
        }`}
      >
        <div className="bg-gradient-to-r from-[#141419] via-[#221D12] to-[#141419] border-b border-[#D4AF37]/30 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Khogo AI Battle Arena</span>
              <h3 className="font-harmond text-2xl font-bold text-white">Side-by-Side Product Comparison</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* AI Verdict Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 via-purple-500/10 to-cyan-400/20 border border-[#D4AF37]/50 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#D4AF37] shrink-0" />
            <div>
              <h4 className="font-harmond text-lg font-bold text-white">AI Value Recommendation</h4>
              <p className="text-xs text-zinc-300">
                <strong>{cheaper.name}</strong> offers the best pricing at ₹{cheaper.price_inr.toLocaleString('en-IN')}, while <strong>{betterRated.name}</strong> leads in user ratings ({betterRated.rating || '4.5'}★).
              </p>
            </div>
          </div>

          {/* 2-Column Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[p1, p2].map((p, idx) => (
              <div key={p.id || idx} className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                <div className="h-40 rounded-xl overflow-hidden bg-zinc-950 relative">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40">
                    {p.platform}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">{p.brand}</span>
                  <h5 className="font-harmond text-lg font-bold line-clamp-1">{p.name}</h5>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                  <span className="text-xl font-bold text-[#D4AF37]">₹{Number(p.price_inr).toLocaleString('en-IN')}</span>
                  <a
                    href={`https://khogo-ai.onrender.com/api/redirect?name=${encodeURIComponent(p.name)}&brand=${encodeURIComponent(p.brand)}&platform=${encodeURIComponent(p.platform)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-cyan-400 text-black text-xs font-bold flex items-center gap-1.5"
                  >
                    Buy Now <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. SECRET ADMIN PANEL MODAL
export function AdminPanelModal({ onClose, themeMode }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://khogo-ai.onrender.com/api/reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) fetchReports();
  }, [authenticated]);

  const handleResolve = async (id, action) => {
    try {
      await fetch(`https://khogo-ai.onrender.com/api/admin/resolve-report?report_id=${id}&action=${action}`, {
        method: 'POST'
      });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const isLight = themeMode === 'ivory';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl ${
          isLight ? 'bg-white border-zinc-300 text-zinc-900' : 'bg-[#0B0B0E] border-[#D4AF37]/40 text-zinc-100'
        }`}
      >
        <div className="bg-gradient-to-r from-[#141419] via-[#221D12] to-[#141419] border-b border-[#D4AF37]/30 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Secret Admin Vault</span>
              <h3 className="font-harmond text-2xl font-bold text-white">Database Issue Reports Manager</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!authenticated ? (
            <div className="max-w-xs mx-auto py-8 text-center space-y-4">
              <h4 className="font-harmond text-2xl font-bold">Enter Admin PIN</h4>
              <p className="text-xs text-zinc-400">Enter your 4-digit security PIN (default: 1234) to manage user fix reports.</p>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-32 text-center text-2xl tracking-widest bg-zinc-900 border border-white/20 px-4 py-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <div>
                <button
                  onClick={() => {
                    if (pin === '1234' || pin === '0000') setAuthenticated(true);
                    else alert('Incorrect PIN (try 1234)');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-cyan-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Unlock Admin Panel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Pending User Fix Reports ({reports.length})
                </span>
                <button onClick={fetchReports} className="text-xs text-cyan-400 hover:underline cursor-pointer">
                  Refresh List
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-zinc-400">Loading reports from Supabase...</div>
              ్‌) : reports.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-sm">No pending fix reports in database. All clear!</div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div key={rep.id || Math.random()} className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37]">
                          {rep.issue_type} • {rep.platform}
                        </span>
                        <span className="text-[11px] text-zinc-400">{new Date(rep.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <h5 className="font-bold text-sm text-white">{rep.product_name}</h5>
                      <p className="text-xs text-zinc-300 bg-black/40 p-2.5 rounded-xl border border-white/5">{rep.correct_info}</p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleResolve(rep.id, 'dismiss')}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Dismiss
                        </button>
                        <button
                          onClick={() => handleResolve(rep.id, 'approve')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}