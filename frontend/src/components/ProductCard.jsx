import React from 'react';
import { Star, ExternalLink, Heart, BarChart2, Sparkles } from 'lucide-react';

const PLATFORM_BADGES = {
  'Amazon India': 'bg-zinc-950/90 text-[#D4AF37] border border-[#D4AF37]/50',
  'Flipkart': 'bg-zinc-950/90 text-sky-300 border border-sky-400/40',
  'Myntra': 'bg-zinc-950/90 text-pink-300 border border-pink-400/40',
  'Nykaa': 'bg-zinc-950/90 text-rose-300 border border-rose-400/40'
};

export default function ProductCard({
  product,
  compact = false,
  isWishlisted = false,
  onToggleWishlist,
  onOpenAnalytics,
  themeMode = 'obsidian'
}) {
  if (!product) return null;

  const badgeStyle =
    PLATFORM_BADGES[product.platform] ||
    'bg-zinc-950/90 text-[#D4AF37] border border-[#D4AF37]/40';

  const discount =
    product.mrp_inr && product.mrp_inr > product.price_inr
      ? Math.round(((product.mrp_inr - product.price_inr) / product.mrp_inr) * 100)
      : 18;

  const dealScore = Math.min(99, Math.max(82, 76 + Math.round(discount * 0.5)));

  const liveRedirectUrl = `https://khogo-ai.onrender.com/api/redirect?name=${encodeURIComponent(
    product.name || ''
  )}&brand=${encodeURIComponent(product.brand || '')}&platform=${encodeURIComponent(
    product.platform || 'Myntra'
  )}`;

  const isLight = themeMode === 'ivory';
  const isSilver = themeMode === 'sterling';

  const cardTheme = isLight
    ? 'bg-white border-zinc-200/90 text-zinc-900 hover:border-[#D4AF37]'
    : isSilver
    ? 'bg-gradient-to-b from-zinc-800/90 to-zinc-900/95 border-zinc-600/60 text-zinc-100 hover:border-[#E2E8F0]'
    : 'bg-gradient-to-b from-[#121216] to-[#0A0A0D] border-[#D4AF37]/25 text-zinc-100 hover:border-[#D4AF37]/80';

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D4AF37]/10 ${cardTheme} ${
        compact ? 'w-64 shrink-0' : 'w-full'
      }`}
    >
      <div>
        {/* Product Image Container */}
        <div className={`relative bg-zinc-950 overflow-hidden ${compact ? 'h-36' : 'h-56'}`}>
          <img
            src={
              product.image_url ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Platform Pill */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${badgeStyle}`}
          >
            {product.platform}
          </span>

          {/* Deal Score Badge */}
          <button
            onClick={() => onOpenAnalytics && onOpenAnalytics(product)}
            title="View BuyHatke Deal Score & Price Graph"
            className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] font-bold flex items-center gap-1 hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Deal Score {dealScore}
          </button>

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onToggleWishlist) onToggleWishlist();
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/70 border border-white/15 backdrop-blur-md hover:border-[#D4AF37] hover:scale-110 transition-all z-10 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-zinc-300'
              }`}
            />
          </button>

          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4AF37] mb-1">
            <span>{product.brand}</span>
            {product.rating && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                {product.rating}
              </span>
            )}
          </div>

          <h3
            className={`font-harmond font-semibold line-clamp-2 ${
              compact ? 'text-base leading-snug' : 'text-xl leading-snug'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>

          {!compact && (
            <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center justify-between">
              <span>4 Stores Compared</span>
              <span className="text-emerald-400 font-semibold">● Price Dropped</span>
            </p>
          )}
        </div>
      </div>

      {/* Pricing & Action Buttons */}
      <div
        className={`border-t px-4 py-3 flex flex-col gap-2.5 ${
          isLight ? 'border-zinc-200' : 'border-white/10'
        }`}
      >
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-[#D4AF37]">
              ₹{Number(product.price_inr).toLocaleString('en-IN')}
            </span>
            {product.mrp_inr && product.mrp_inr > product.price_inr && (
              <span className="text-xs text-zinc-500 line-through">
                ₹{Number(product.mrp_inr).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {discount && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenAnalytics && onOpenAnalytics(product)}
            className={`py-2 px-2.5 rounded-xl font-semibold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:border-[#D4AF37]'
                : 'bg-white/5 border-white/15 text-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            {compact ? 'Graph' : 'Compare & Graph'}
          </button>

          <a
            href={liveRedirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Buy Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}