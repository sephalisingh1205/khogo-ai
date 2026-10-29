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
  SlidersHorizontal,
  Wrench,
  Menu,
  X,
  Shield,
  FileText,
  Compass
} from 'lucide-react';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';
import PriceAnalyticsModal from './components/PriceAnalyticsModal';
import FixReporterModal from './components/FixReporterModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import {
  PrivacyPolicyPage,
  TermsAndConditionsPage,
  Custom404Page
} from './components/LegalAndErrorPages';

const CATEGORIES = ['All', 'Footwear', 'Beauty', 'Electronics', 'Apparel', 'Accessories'];

const THEME_MODES = [
  { id: 'obsidian', label: 'Obsidian Gold', icon: Moon },
  { id: 'sterling', label: 'Sterling Silver', icon: Layers },
  { id: 'ivory', label: 'Ivory Luxe', icon: Sun }
];

export default function App() {
  // Page Load Splash Animation
  const [booting, setBooting] = useState(true);

  // Page Routing: 'home' | 'wishlist' | 'privacy' | 'terms' | '404'
  const [activePage, setActivePage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('khogo_theme') || 'obsidian';
  });

  // Modals: Price Analytics & Database Fix Reporter
  const [activeAnalyticsProduct, setActiveAnalyticsProduct] = useState(null);
  const [reporterTargetProduct, setReporterTargetProduct] = useState(null);
  const [isReporterOpen, setIsReporterOpen] = useState(false);

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('bazaar_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [priceAlerts, setPriceAlerts] = useState(() => {
    const saved = localStorage.getItem('khogo_price_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Trigger Luxury Page Load Splash Screen & Check URL Path for 404
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 950);
    const path = window.location.pathname;
    if (path && path !== '/' && !['/index.html'].includes(path)) {
      setActivePage('404');
    }
    return () => clearTimeout(timer);
  }, []);

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

  const openFixReporter = (product = null) => {
    setReporterTargetProduct(product);
    setIsReporterOpen(true);
    setMobileMenuOpen(false);
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

  const displayedProducts = useMemo(() => {
    const baseList = activePage === 'wishlist' ? wishlist : products;
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
  }, [activePage, wishlist, products, searchQuery, sortBy]);

  const isLight = themeMode === 'ivory';
  const isSilver = themeMode === 'sterling';

  const rootBg = isLight
    ? 'bg-[#FAF8F5] text-zinc-900'
    : isSilver
    ? 'bg-[#141619] text-zinc-100'
    : 'bg-[#070709] text-zinc-100';

  // Luxury Initial Page Load Splash Animation
  if (booting) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070709] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-20 h-20 rounded-3xl p-[2px] bg-gradient-to-tr from-purple-500 via-[#D4AF37] to-cyan-400 shadow-2xl shadow-purple-500/30 animate-bounce">
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#070709]">
            <img src="/favicon.ico" alt="Khogo AI" className="w-full h-full object-cover" />
          </div>
        </div>
        <h1 className="font-harmond text-4xl sm:text-5xl font-bold text-white mt-5 tracking-wide">
          Khogo{' '}
          <span className="italic bg-gradient-to-r from-[#D4AF37] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-400 mt-2">
          Initializing Price Intelligence Vault...
        </p>
        <div className="w-48 h-1 rounded-full bg-zinc-800 overflow-hidden mt-5">
          <div className="h-full w-full bg-gradient-to-r from-purple-500 via-[#D4AF37] to-cyan-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${rootBg}`}>
      {/* Sticky Responsive Header */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-xl border-b transition-colors ${
          isLight ? 'bg-white/90 border-zinc-200' : 'bg-[#08080C]/90 border-[#D4AF37]/25'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
            onClick={() => {
              setActivePage('home');
              setMobileMenuOpen(false);
            }}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl p-[1.5px] bg-gradient-to-tr from-purple-500 via-[#D4AF37] to-cyan-400 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#070709]">
                <img
                  src="/favicon.ico"
                  alt="Khogo AI"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </div>
            <div>
              <h1 className="font-harmond text-2xl sm:text-4xl font-bold tracking-wide leading-none">
                Khogo{' '}
                <span className="italic bg-gradient-to-r from-[#D4AF37] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
                Black • Gold • Price Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher (Desktop) */}
            <div
              className={`hidden lg:flex items-center p-1 rounded-xl border ${
                isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-900/90 border-white/10'
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
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Report Broken Link / Database Fix Button */}
            <button
              onClick={() => openFixReporter(null)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              title="Report Broken Link or Update Database Info"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Report Fix</span>
            </button>

            {/* Alerts Counter */}
            {priceAlerts.length > 0 && (
              <button
                onClick={() => {
                  const first =
                    products.find((p) => p.id === priceAlerts[0].id) || products[0];
                  if (first) setActiveAnalyticsProduct(first);
                }}
                className="px-2.5 sm:px-3 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Active Price Drop Alerts"
              >
                <Bell className="w-4 h-4" />
                <span>{priceAlerts.length}</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() =>
                setActivePage(activePage === 'wishlist' ? 'home' : 'wishlist')
              }
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                activePage === 'wishlist'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                  : isLight
                  ? 'border-zinc-300 bg-white text-zinc-700 hover:border-[#D4AF37]'
                  : 'border-white/15 bg-zinc-900 text-zinc-300 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              }`}
              title="View Saved Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  activePage === 'wishlist' ? 'fill-[#D4AF37] text-[#D4AF37]' : ''
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#D4AF37] to-cyan-400 text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-white/15 bg-zinc-900 text-[#D4AF37] cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D4AF37]/20 bg-[#0B0B0F] px-4 py-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-3 gap-2">
              {THEME_MODES.map((m) => {
                const Icon = m.icon;
                const active = themeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setThemeMode(m.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border ${
                      active
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                        : 'bg-zinc-900 text-zinc-300 border-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate">{m.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => openFixReporter(null)}
                className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-4 h-4" /> Report Database Fix
              </button>
              <button
                onClick={() => {
                  setActivePage('privacy');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 flex items-center justify-center gap-1.5"
              >
                <Shield className="w-4 h-4 text-[#D4AF37]" /> Privacy Policy
              </button>
              <button
                onClick={() => {
                  setActivePage('terms');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-[#D4AF37]" /> Terms of Use
              </button>
              <button
                onClick={() => {
                  setActivePage('404');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 flex items-center justify-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-[#D4AF37]" /> Test 404 Page
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Route Views: Privacy Policy / Terms / Custom 404 / Main Catalog */}
      {activePage === 'privacy' ? (
        <PrivacyPolicyPage onBack={() => setActivePage('home')} themeMode={themeMode} />
      ) : activePage === 'terms' ? (
        <TermsAndConditionsPage onBack={() => setActivePage('home')} themeMode={themeMode} />
      ) : activePage === '404' ? (
        <Custom404Page
          onBack={() => setActivePage('home')}
          onOpenReporter={() => openFixReporter(null)}
        />
      ) : (
        <>
          {/* Hero Section */}
          {activePage === 'home' && (
            <section
              className={`relative overflow-hidden border-b py-9 sm:py-12 px-4 animate-fadeIn ${
                isLight
                  ? 'bg-gradient-to-b from-amber-50/60 via-white to-white border-zinc-200'
                  : 'bg-gradient-to-b from-[#0E0D18] via-[#09090D] to-[#070709] border-[#D4AF37]/20 text-white'
              }`}
            >
              <div className="max-w-4xl mx-auto text-center space-y-4">
                <span className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] sm:text-xs font-semibold px-3.5 py-1.5 rounded-full tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Harmond Editorial Edition • Real-Time Price Graph & Deal Scanner
                </span>

                <h2 className="font-harmond text-4xl sm:text-6xl font-bold tracking-tight leading-none">
                  Compare Prices.{' '}
                  <span className="italic bg-gradient-to-r from-[#D4AF37] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Shop Smarter.
                  </span>
                </h2>

                <p className="text-zinc-400 text-xs sm:text-base max-w-xl mx-auto px-2">
                  Compare real-time deals across Amazon India, Flipkart, Myntra & Nykaa with 6-month historical price graphs, spam-protected community fixes, and verified Deal Scores.
                </p>

                {/* Mobile-Friendly Search & Deal Scanner Bar */}
                <div className="max-w-2xl mx-auto pt-2">
                  <div
                    className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 rounded-2xl p-2 sm:p-1.5 border shadow-xl ${
                      isLight
                        ? 'bg-white border-zinc-300'
                        : 'bg-zinc-900/90 border-[#D4AF37]/40 shadow-purple-500/10'
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <Search className="w-5 h-5 text-[#D4AF37] ml-2.5 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sneakers, skincare, watches, or paste a link..."
                        className="w-full bg-transparent text-xs sm:text-sm focus:outline-none py-2"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-zinc-400 hover:text-[#D4AF37] px-2 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
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
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {[
                    {
                      label: '4-Store Price Compare',
                      icon: Layers,
                      action: () => displayedProducts[0] && setActiveAnalyticsProduct(displayedProducts[0])
                    },
                    {
                      label: '6-Month Price Graph',
                      icon: TrendingDown,
                      action: () => displayedProducts[1] && setActiveAnalyticsProduct(displayedProducts[1])
                    },
                    {
                      label: 'Report Broken Link / Fix Info',
                      icon: Wrench,
                      action: () => openFixReporter(null)
                    },
                    {
                      label: 'Auto Luxury Coupons',
                      icon: Tag,
                      action: () => displayedProducts[2] && setActiveAnalyticsProduct(displayedProducts[2])
                    }
                  ].map((pill, idx) => {
                    const Icon = pill.icon;
                    return (
                      <button
                        key={idx}
                        onClick={pill.action}
                        className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
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

          {/* Main Product Catalog */}
          <main className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 py-6 sm:py-8 flex-1 animate-fadeIn">
            {activePage === 'wishlist' ? (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-[#D4AF37]/30">
                <div>
                  <h2 className="font-harmond text-3xl font-bold flex items-center gap-2.5">
                    <Heart className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" /> My Saved Wishlist
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Bookmarked items with live price tracking & comparison.
                  </p>
                </div>
                <button
                  onClick={() => setActivePage('home')}
                  className="text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-black px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Back to Catalog
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
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
                <div className="flex items-center justify-end gap-2 text-xs">
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
            {loading && activePage !== 'wishlist' ? (
              <div className="py-24 flex flex-col items-center justify-center text-[#D4AF37] gap-3">
                <Loader2 className="w-9 h-9 animate-spin" />
                <p className="text-xs uppercase tracking-widest text-zinc-400">
                  Loading Live Catalog...
                </p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-20 text-center text-zinc-400 text-sm space-y-3">
                <p>
                  {activePage === 'wishlist'
                    ? 'Your wishlist is empty. Tap the heart icon on any product to save it!'
                    : 'No matching products found for that filter.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Reset Search Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {displayedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isWishlisted={wishlist.some((w) => w.id === prod.id)}
                    onToggleWishlist={() => toggleWishlist(prod)}
                    onOpenAnalytics={(p) => setActiveAnalyticsProduct(p)}
                    onOpenReporter={(p) => openFixReporter(p)}
                    themeMode={themeMode}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Comprehensive Footer with Legal, Fix Reporter & 404 Links */}
      <footer
        className={`border-t py-8 px-4 text-xs ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-500'
            : 'bg-[#050507] border-[#D4AF37]/20 text-zinc-400'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.ico" alt="Logo" className="w-5 h-5 rounded-md" />
            <span className="font-harmond text-lg text-[#D4AF37] font-bold">Khogo AI</span>
            <span>© 2026 • India's Luxury AI Shopping & Price Intelligence Hub</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#D4AF37] cursor-pointer"
            >
              Catalog
            </button>
            <button
              onClick={() => {
                setActivePage('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#D4AF37] cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                setActivePage('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#D4AF37] cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => openFixReporter(null)}
              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" /> Report Broken Link / Fix
            </button>
            <button
              onClick={() => {
                setActivePage('404');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-zinc-500 hover:text-rose-400 cursor-pointer"
            >
              404 Vault
            </button>
          </div>
        </div>
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

      {/* Database Issue & Broken Link Fix Reporter Modal */}
      {isReporterOpen && (
        <FixReporterModal
          product={reporterTargetProduct}
          onClose={() => setIsReporterOpen(false)}
          themeMode={themeMode}
        />
      )}

      {/* Cookie Consent Banner */}
      <CookieConsentBanner onOpenPrivacy={() => setActivePage('privacy')} />

      {/* Minimizable / Maximizable AI Concierge */}
      <ChatWidget
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onOpenAnalytics={(p) => setActiveAnalyticsProduct(p)}
        onOpenReporter={(p) => openFixReporter(p)}
        themeMode={themeMode}
      />
    </div>
  );
}