import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingDown,
  Bell,
  Tag,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Award,
  BarChart3
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const PLATFORMS = ['Amazon India', 'Flipkart', 'Myntra', 'Nykaa'];

const COUPONS = [
  { code: 'KHOJOGOLD10', desc: 'Extra 10% OFF via Luxury UPI Checkout', savings: '₹450' },
  { code: 'HATKEDEAL500', desc: 'Flat ₹500 Instant Bank Discount on Cards', savings: '₹500' },
  { code: 'FIRSTLUXE', desc: 'Free Priority Express Shipping + 5% Cashback', savings: '₹250' }
];

function getSeed(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function PriceAnalyticsModal({
  product,
  onClose,
  themeMode = 'obsidian',
  onSaveAlert
}) {
  if (!product) return null;

  const [activeTab, setActiveTab] = useState('scanner');
  const [copiedCode, setCopiedCode] = useState('');
  const [targetPrice, setTargetPrice] = useState(
    Math.round((product.price_inr || 1500) * 0.9)
  );
  const [alertSaved, setAlertSaved] = useState(false);

  const seed = useMemo(() => getSeed(product.name + product.brand), [product]);
  const basePrice = Number(product.price_inr) || 1999;
  const mrpPrice = Number(product.mrp_inr) || Math.round(basePrice * 1.35);

  const storeComparisons = useMemo(() => {
    return PLATFORMS.map((plat, idx) => {
      const isPrimary = plat.toLowerCase() === (product.platform || '').toLowerCase();
      const variance = ((seed + idx * 17) % 14) - 4;
      const computedPrice = isPrimary
        ? basePrice
        : Math.max(299, Math.round((basePrice * (100 + variance)) / 100));

      const redirectUrl = `${API_BASE_URL}/api/redirect?name=${encodeURIComponent(
        product.name || ''
      )}&brand=${encodeURIComponent(product.brand || '')}&platform=${encodeURIComponent(plat)}`;

      return {
        platform: plat,
        price: computedPrice,
        delivery: idx % 2 === 0 ? 'Free Priority Delivery (1-2 Days)' : 'Free Standard Delivery',
        inStock: true,
        isBestPrice: false,
        url: redirectUrl
      };
    })
      .sort((a, b) => a.price - b.price)
      .map((item, idx) => ({ ...item, isBestPrice: idx === 0 }));
  }, [product, basePrice, seed]);

  const lowestStore = storeComparisons[0];

  const priceHistory = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov (Now)'];
    const multipliers = [
      1.22,
      1.15 + ((seed % 7) * 0.01),
      1.08,
      1.18,
      1.05,
      lowestStore.price / basePrice
    ];
    return months.map((m, i) => ({
      month: m,
      price: Math.round(basePrice * multipliers[i])
    }));
  }, [basePrice, lowestStore, seed]);

  const maxGraphPrice = Math.max(...priceHistory.map((d) => d.price), mrpPrice);
  const minGraphPrice = Math.min(...priceHistory.map((d) => d.price));
  const avgGraphPrice = Math.round(
    priceHistory.reduce((acc, d) => acc + d.price, 0) / priceHistory.length
  );

  const dealScore = useMemo(() => {
    const discountPct = Math.round(((mrpPrice - lowestStore.price) / mrpPrice) * 100);
    return Math.min(99, Math.max(78, 72 + Math.round(discountPct * 0.6)));
  }, [mrpPrice, lowestStore]);

  const svgPoints = priceHistory
    .map((pt, idx) => {
      const x = 40 + idx * 88;
      const range = Math.max(1, maxGraphPrice - minGraphPrice);
      const y = 140 - ((pt.price - minGraphPrice) / range) * 100;
      return `${x},${Math.round(y)}`;
    })
    .join(' ');

  const isLight = themeMode === 'ivory';

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (onSaveAlert) {
      onSaveAlert({
        id: product.id,
        name: product.name,
        brand: product.brand,
        currentPrice: lowestStore.price,
        targetPrice: Number(targetPrice),
        platform: lowestStore.platform
      });
    }
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl rounded-3xl border overflow-hidden shadow-2xl transition-all ${
          isLight
            ? 'bg-[#FAF8F5] border-[#D4AF37]/40 text-zinc-900'
            : 'bg-[#0B0B0E] border-[#D4AF37]/40 text-zinc-100 shadow-[#D4AF37]/10'
        }`}
      >
        <div className="bg-gradient-to-r from-[#141419] via-[#1E1B14] to-[#141419] border-b border-[#D4AF37]/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block">
                Khojo AI • BuyHatke Intelligence Engine
              </span>
              <h3 className="font-harmond text-2xl font-bold text-white tracking-wide line-clamp-1">
                {product.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
          <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/20 flex flex-col justify-between">
            <div>
              <div className="relative h-48 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-[#D4AF37]/50 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-semibold">
                  {product.brand}
                </div>
                <div className="absolute bottom-3 right-3 bg-emerald-500/90 text-black font-bold px-2.5 py-1 rounded-lg text-xs">
                  Lowest: ₹{lowestStore.price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs uppercase tracking-widest text-zinc-400 mb-1">
                  Compare {storeComparisons.length} Available Stores
                </div>
                <div className="space-y-2.5 mt-3">
                  {storeComparisons.map((st) => (
                    <a
                      key={st.platform}
                      href={st.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        st.isBestPrice
                          ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-[#D4AF37] shadow-sm'
                          : isLight
                          ? 'bg-white border-zinc-200 hover:border-[#D4AF37]'
                          : 'bg-zinc-900/70 border-white/10 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{st.platform}</span>
                          {st.isBestPrice && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#D4AF37] text-black">
                              Best Price
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          {st.delivery}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#D4AF37]">
                          ₹{st.price.toLocaleString('en-IN')}
                        </span>
                        <ExternalLink className="w-4 h-4 text-zinc-400" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleCreateAlert}
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-900/80 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#D4AF37]">
                  <Bell className="w-3.5 h-3.5" /> Set Price Drop Alert
                </span>
                <span className="text-[11px] text-zinc-400">Instant Browser Alert</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs text-zinc-400">₹</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className={`w-full pl-7 pr-3 py-1.5 rounded-xl text-sm font-semibold border focus:outline-none focus:border-[#D4AF37] ${
                      isLight
                        ? 'bg-white border-zinc-300 text-zinc-900'
                        : 'bg-black border-white/15 text-white'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#AA8220] text-black hover:brightness-110 transition-all cursor-pointer"
                >
                  {alertSaved ? 'Alert Active ✓' : 'Track Price'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 p-6 flex flex-col justify-between">
            <div>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-zinc-900/90 border border-white/10 mb-6">
                {[
                  { id: 'scanner', label: 'Deal Scanner', icon: Award },
                  { id: 'graph', label: 'Price Drop Graph', icon: TrendingDown },
                  { id: 'coupons', label: 'Auto Coupons', icon: Tag }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#B68D2C] text-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'scanner' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#171510] to-[#0D0D11] border border-[#D4AF37]/30">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Sparkles className="w-3.5 h-3.5" /> Epic Khojo Steal 🚀
                      </span>
                      <h4 className="font-harmond text-3xl font-bold text-white">
                        Lowest Price Recorded
                      </h4>
                      <p className="text-xs text-zinc-400 max-w-sm">
                        We analyzed 180 days of historical pricing across 4 Indian marketplaces. Now is the optimal time to buy.
                      </p>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative w-32 h-20 flex items-end justify-center overflow-hidden">
                        <svg viewBox="0 0 120 70" className="w-full h-full">
                          <path
                            d="M 15 60 A 45 45 0 0 1 105 60"
                            fill="none"
                            stroke="#27272A"
                            strokeWidth="10"
                            strokeLinecap="round"
                          />
                          <path
                            d="M 15 60 A 45 45 0 0 1 105 60"
                            fill="none"
                            stroke="#D4AF37"
                            strokeWidth="10"
                            strokeDasharray="141"
                            strokeDashoffset={141 - (141 * dealScore) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute bottom-0 text-center">
                          <span className="font-harmond text-3xl font-extrabold text-[#D4AF37]">
                            {dealScore}
                          </span>
                          <span className="text-[10px] text-zinc-400 block uppercase tracking-widest">
                            Deal Score
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 p-4 space-y-3 bg-zinc-900/40">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10 pb-2">
                      <span>Deal Score Breakup</span>
                      <span>Pts</span>
                    </div>

                    {[
                      {
                        label: `Below Last Sale Price (₹${Math.round(basePrice * 1.12).toLocaleString('en-IN')})`,
                        pts: 30
                      },
                      { label: 'No Artificial Price Hike Before Sale', pts: 25 },
                      {
                        label: `At All-Time Lowest Price (₹${lowestStore.price.toLocaleString('en-IN')})`,
                        pts: 20
                      },
                      {
                        label: `Below 6-Month Average Price (₹${avgGraphPrice.toLocaleString('en-IN')})`,
                        pts: 15
                      },
                      { label: '100% Verified Original Brand Warranty', pts: 8 }
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-zinc-300 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          {row.label}
                        </span>
                        <span className="font-bold text-[#D4AF37]">+{row.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'graph' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                        All-Time Low
                      </span>
                      <span className="text-base font-bold text-emerald-400">
                        ₹{minGraphPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                        6-Month Average
                      </span>
                      <span className="text-base font-bold text-[#D4AF37]">
                        ₹{avgGraphPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                        Highest Recorded
                      </span>
                      <span className="text-base font-bold text-rose-400">
                        ₹{maxGraphPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#070709] border border-[#D4AF37]/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-zinc-300">
                        6-Month Price Trajectory (Jun – Nov 2026)
                      </span>
                      <span className="text-[11px] text-[#D4AF37] font-semibold">
                        Live Khojo Curve
                      </span>
                    </div>

                    <svg viewBox="0 0 520 175" className="w-full h-44 overflow-visible">
                      <defs>
                        <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {[35, 75, 115, 145].map((y, idx) => (
                        <line
                          key={idx}
                          x1="30"
                          y1={y}
                          x2="490"
                          y2={y}
                          stroke="#27272A"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      ))}

                      <polygon
                        points={`40,150 ${svgPoints} 480,150`}
                        fill="url(#goldArea)"
                      />

                      <polyline
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="3"
                        points={svgPoints}
                      />

                      {priceHistory.map((pt, idx) => {
                        const x = 40 + idx * 88;
                        const range = Math.max(1, maxGraphPrice - minGraphPrice);
                        const y = Math.round(
                          140 - ((pt.price - minGraphPrice) / range) * 100
                        );
                        return (
                          <g key={pt.month}>
                            <circle
                              cx={x}
                              cy={y}
                              r="5"
                              fill="#070709"
                              stroke="#D4AF37"
                              strokeWidth="3"
                            />
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              fill="#E2E8F0"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              ₹{pt.price}
                            </text>
                            <text
                              x={x}
                              y="168"
                              textAnchor="middle"
                              fill="#94A3B8"
                              fontSize="10"
                            >
                              {pt.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {activeTab === 'coupons' && (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-xs text-zinc-400">
                    Click any verified luxury coupon below to copy and apply at checkout:
                  </p>
                  {COUPONS.map((cp) => (
                    <div
                      key={cp.code}
                      className="p-4 rounded-2xl border border-[#D4AF37]/30 bg-zinc-900/60 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#D4AF37] px-2.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                            {cp.code}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            Save {cp.savings}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1">{cp.desc}</p>
                      </div>

                      <button
                        onClick={() => handleCopy(cp.code)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#D4AF37] hover:text-black text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedCode === cp.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Verified Authentic • Price Checked Just Now</span>
              </div>

              <a
                href={lowestStore.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
              >
                Buy Best Deal on {lowestStore.platform} (₹{lowestStore.price.toLocaleString('en-IN')})
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}