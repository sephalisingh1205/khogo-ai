import React from 'react';
import { Star, ExternalLink, Heart } from 'lucide-react';

const PLATFORM_STYLES = {
  'Amazon India': 'bg-amber-500 text-slate-950',
  'Flipkart': 'bg-blue-600 text-white',
  'Myntra': 'bg-pink-600 text-white',
  'Nykaa': 'bg-rose-500 text-white',
};

export default function ProductCard({ 
  product, 
  compact = false, 
  isWishlisted = false, 
  onToggleWishlist 
}) {
  if (!product) return null;

  const badgeStyle = PLATFORM_STYLES[product.platform] || 'bg-indigo-600 text-white';

  const discount =
    product.mrp_inr && product.mrp_inr > product.price_inr
      ? Math.round(((product.mrp_inr - product.price_inr) / product.mrp_inr) * 100)
      : null;

  // Real-time BuyHatke resolver URL
  const liveRedirectUrl = `http://localhost:8000/api/redirect?name=${encodeURIComponent(
    product.name || ''
  )}&brand=${encodeURIComponent(product.brand || '')}&platform=${encodeURIComponent(
    product.platform || 'Myntra'
  )}`;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        compact ? 'w-60 shrink-0' : 'w-full'
      }`}
    >
      <div>
        {/* Product Image & Badges */}
        <div className={`relative bg-slate-100 overflow-hidden ${compact ? 'h-36' : 'h-52'}`}>
          <img
            src={
              product.image_url ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
            }
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeStyle}`}>
            {product.platform}
          </span>

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onToggleWishlist) onToggleWishlist();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all z-10"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`} 
            />
          </button>

          {!product.in_stock && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={compact ? 'p-3' : 'p-4'}>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {product.brand}
          </div>
          <h3
            className={`font-semibold text-slate-800 line-clamp-2 ${
              compact ? 'text-xs leading-snug' : 'text-sm leading-snug'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            {product.rating && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-700">{product.rating}</span>
              </div>
            )}
            {product.category && (
              <span className="text-[11px] text-slate-400 capitalize">
                ({product.category})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price & Buy Button */}
      <div className={`border-t border-slate-100 flex items-center justify-between ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-bold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
              ₹{product.price_inr}
            </span>
            {product.mrp_inr && product.mrp_inr > product.price_inr && (
              <span className="text-xs text-slate-400 line-through">₹{product.mrp_inr}</span>
            )}
          </div>
          {discount && (
            <span className="text-[11px] font-semibold text-emerald-600 block">
              {discount}% OFF
            </span>
          )}
        </div>

        <a
          href={liveRedirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            compact
              ? 'bg-indigo-600 text-white text-xs hover:bg-indigo-700 shadow-sm'
              : 'bg-indigo-50 text-indigo-700 text-sm hover:bg-indigo-600 hover:text-white'
          }`}
        >
          {compact ? 'Buy' : 'View Deal'}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}