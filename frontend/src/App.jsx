import React, { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  Heart,
  Search,
  Sparkles,
  TrendingDown,
  Bell,
  Tag,
  Layers,
  Sun,
  Moon,
  SlidersHorizontal
} from 'lucide-react';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import PriceAnalyticsModal from './components/PriceAnalyticsModal';

const CATEGORIES = ['All', 'Footwear', 'Beauty', 'Electronics', 'Apparel', 'Accessories'];

const THEME_MODES = [
  { id: 'obsidian', label: 'Obsidian Gold', icon: Moon },
  { id: 'sterling', label: 'Sterling Silver', icon: Layers },
  { id: 'ivory', label: 'Ivory Luxe', icon: Sun }
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Theme State: 'obsidian' | 'sterling' | 'ivory'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('khogo_theme') || 'obsidian';
  });

  // Active Product for BuyHatke Price Graph & Comparison Modal
  const [activeAnalyticsProduct, setActiveAnalyticsProduct] = useState(null);

  // Wishlist State
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('bazaar_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Price Drop Alerts State
  const [priceAlerts, setPriceAlerts] = useState(() => {
    const saved = localStorage.getItem('khogo_price_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('khogo_theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('bazaar_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('khogo_price_alerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) return prev.filter((item) => item.id !== product.id);
      return [...prev, product];
    });
  };

  const handleSavePriceAlert = (alertObj) => {
    setPriceAlerts((prev) => {
      const filtered = prev.filter((a) => a.id !== alertObj.id);
      return [alertObj, ...filtered];
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam =
          selectedCategory === 'All' ? '' : `?category=${selectedCategory.toLowerCase()}`;
        const res = await fetch(
          `https://khogo-ai.onrender.com/api/products${categoryParam}`
        );
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  // Filter & Sort Products
  const displayedProducts = useMemo(() => {
    const baseList = showWishlist ? wishlist : products;
    const filtered = baseList.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (item.name || '').toLowerCase().includes(q) ||
        (item.brand || '').toLowerCase().includes(q) ||
        (item.platform || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => Number(a.price_inr) - Number(b.price_inr));
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => Number(b.price_inr) - Number(a.price_inr));
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    return sorted;
  }, [showWishlist, wishlist, products, searchQuery, sortBy]);

  const isLight = themeMode === 'ivory';
  const isSilver = themeMode === 'sterling';

  const rootBg = isLight
    ? 'bg-[#FAF8F5] text-zinc-900'
    : isSilver
    ? 'bg-[#141619] text-zinc-100'
    : 'bg-[#070709] text-zinc-100';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${rootBg}`}>
      {/* Main Luxury Header Synced with Favicon */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors ${
          isLight
            ? 'bg-white/90 border-zinc-200'
            : 'bg-[#08080C]/90 border-[#D4AF37]/25'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo Using Favicon Image */}
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setShowWishlist(false)}
          >
            <div className="relative w-12 h-12 rounded-2xl p-[1.5px] bg-gradient-to-tr from-purple-500 via-[#D4AF37] to-cyan-400 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#070709]">
                <img
                  src="/favicon.ico"
                  alt="Khogo AI"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </div>
            <div>
              <h1 className="font-harmond text-3xl sm:text-4xl font-bold tracking-wide leading-none">
                Khogo{' '}
                <span className="italic bg-gradient-to-r from-[#D4AF37] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 mt-1">
                Black • Gold • Price Intelligence
              </p>
            </div>
          </div>

          {/* Theme Switcher + Alerts + Wishlist */}
          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-zinc-100 border-zinc-300'
                  : 'bg-zinc-900/90 border-white/10'
              }`}
            >
              {THEME_MODES.map((m) => {
                const Icon = m.icon;
                const active = themeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setThemeMode(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B68D2C] text-black shadow'
                        : 'text-zinc-400 hover:text-[#D4AF37]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {priceAlerts.length > 0 && (
              <button
                onClick={() => {
                  const first =
                    products.find((p) => p.id === priceAlerts[0].id) || products[0];
                  if (first) setActiveAnalyticsProduct(first);
                }}
                className="px-3 py-2.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Active Price Drop Alerts"
              >
                <Bell className="w-4 h-4" />
                <span>{priceAlerts.length}</span>
              </button>
            )}

            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                showWishlist
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                  : isLight
                  ? 'border-zinc-300 bg-white text-zinc-700 hover:border-[#D4AF37]'
                  : 'border-white/15 bg-zinc-900 text-zinc-300 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              }`}
              title="View Saved Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  showWishlist ? 'fill-[#D4AF37] text-[#D4AF37]' : ''
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#D4AF37] to-cyan-400 text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Clean Hero Section Synced with Gold + Neon Cyan/Purple Accents */}
      {!showWishlist && (
        <section
          className={`relative overflow-hidden border-b py-12 px-4 ${
            isLight
              ? 'bg-gradient-to-b from-amber-50/60 via-white to-white border-zinc-200'
              : 'bg-gradient-to-b from-[#0E0D18] via-[#09090D] to-[#070709] border-[#D4AF37]/20 text-white'
          }`}
        >
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Harmond Editorial Edition • Real-Time Price Graph & Deal Scanner
            </span>

            <h2 className="font-harmond text-4xl sm:text-6xl font-bold tracking-tight leading-none">
              Compare Prices.{' '}
              <span className="italic bg-gradient-to-r from-[#D4AF37] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Shop Smarter.
              </span>
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
              Compare real-time deals across Amazon India, Flipkart, Myntra & Nykaa with 6-month historical price graphs and verified Deal Scores.
            </p>

            {/* Clean Search & Deal Scanner Bar */}
            <div className="max-w-2xl mx-auto pt-2">
              <div
                className={`flex items-center rounded-2xl p-1.5 border shadow-xl ${
                  isLight
                    ? 'bg-white border-zinc-300'
                    : 'bg-zinc-900/90 border-[#D4AF37]/40 shadow-purple-500/10'
                }`}
              >
                <Search className="w-5 h-5 text-[#D4AF37] ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sneakers, skincare, watches, or paste a store link..."
                  className="w-full bg-transparent text-sm focus:outline-none py-2"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-zinc-400 hover:text-[#D4AF37] px-2.5 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    if (displayedProducts[0]) {
                      setActiveAnalyticsProduct(displayedProducts[0]);
                    }
                  }}
                  className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-cyan-400 text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shrink-0 hover:brightness-110 transition-all cursor-pointer"
                >
                  Scan Graph
                </button>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
              {[
                { label: '4-Store Price Compare', icon: Layers },
                { label: '6-Month Price Graph', icon: TrendingDown },
                { label: 'Instant Price Drop Alerts', icon: Bell },
                { label: 'Auto Luxury Coupons', icon: Tag }
              ].map((pill, idx) => {
                const Icon = pill.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (displayedProducts[idx]) {
                        setActiveAnalyticsProduct(displayedProducts[idx]);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isLight
                        ? 'bg-white border-zinc-200 text-zinc-700 hover:border-[#D4AF37]'
                        : 'bg-zinc-900/70 border-white/10 text-zinc-300 hover:border-cyan-400/50 hover:text-cyan-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {showWishlist ? (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#D4AF37]/30">
            <div>
              <h2 className="font-harmond text-3xl font-bold flex items-center gap-2.5">
                <Heart className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" /> My Saved Wishlist
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Bookmarked items with live price tracking & comparison.
              </p>
            </div>
            <button
              onClick={() => setShowWishlist(false)}
              className="text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-black px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B68D2C] text-black shadow-md'
                      : isLight
                      ? 'bg-white text-zinc-700 border border-zinc-300 hover:border-[#D4AF37]'
                      : 'bg-zinc-900 text-zinc-300 border border-white/10 hover:border-[#D4AF37]/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-zinc-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:border-[#D4AF37] ${
                  isLight
                    ? 'bg-white border-zinc-300 text-zinc-900'
                    : 'bg-zinc-900 border-white/15 text-zinc-200'
                }`}
              >
                <option value="featured">Featured Steals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading && !showWishlist ? (
          <div className="py-24 flex flex-col items-center justify-center text-[#D4AF37] gap-3">
            <Loader2 className="w-9 h-9 animate-spin" />
            <p className="text-xs uppercase tracking-widest text-zinc-400">
              Loading Live Catalog...
            </p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-20 text-center text-zinc-400 text-sm">
            {showWishlist
              ? 'Your wishlist is empty. Tap the heart icon on any product to save it!'
              : 'No matching products found. Try clearing your search filter.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isWishlisted={wishlist.some((w) => w.id === prod.id)}
                onToggleWishlist={() => toggleWishlist(prod)}
                onOpenAnalytics={(p) => setActiveAnalyticsProduct(p)}
                themeMode={themeMode}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-500'
            : 'bg-[#050507] border-[#D4AF37]/20 text-zinc-500'
        }`}
      >
        <span className="font-harmond text-base text-[#D4AF37] font-bold mr-2">
          Khogo AI
        </span>
        © 2026 • Built with FastAPI, Supabase, Live Link Resolution & Open-Source LLMs.
      </footer>

      {/* BuyHatke Price Comparison & 6-Month Graph Modal */}
      {activeAnalyticsProduct && (
        <PriceAnalyticsModal
          product={activeAnalyticsProduct}
          onClose={() => setActiveAnalyticsProduct(null)}
          themeMode={themeMode}
          priceAlerts={priceAlerts}
          onSaveAlert={handleSavePriceAlert}
        />
      )}

      {/* Minimizable / Maximizable AI Concierge */}
      <ChatWidget
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onOpenAnalytics={(p) => setActiveAnalyticsProduct(p)}
        themeMode={themeMode}
      />
    </div>
  );
}