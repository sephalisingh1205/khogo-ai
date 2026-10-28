import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, RotateCcw, ShieldCheck, Loader2, Heart } from 'lucide-react';
import ProductCard from './components/ProductCard';
import ChatWidget from './components/ChatWidget';

const CATEGORIES = ['All', 'Footwear', 'Beauty', 'Electronics', 'Apparel', 'Accessories'];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('bazaar_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bazaar_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id); 
      }
      return [...prev, product]; 
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = selectedCategory === 'All' ? '' : `?category=${selectedCategory.toLowerCase()}`;
        // Pointing to live Render URL
        const res = await fetch(`https://khogo-ai.onrender.com/api/products${categoryParam}`);
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

  const displayedProducts = showWishlist ? wishlist : products;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setShowWishlist(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Bazaar<span className="text-indigo-600">AI</span>
              </h1>
              <p className="text-[11px] text-slate-500">India's Smart Shopping & Support Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 mr-4">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-indigo-600" /> Free Delivery</span>
              <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-indigo-600" /> 7-Day Returns</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-600" /> 100% Verified</span>
            </div>
            
            <button 
              onClick={() => setShowWishlist(!showWishlist)}
              className="relative p-2.5 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-500 transition-all shadow-sm"
              title="View Wishlist"
            >
              <Heart className={`w-5 h-5 ${showWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {!showWishlist && (
        <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="inline-block bg-white/10 border border-white/20 text-indigo-200 text-xs font-semibold px-3.5 py-1 rounded-full tracking-wide uppercase">
              Powered by Open-Source AI & Real-Time Link Resolver
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Shop Top Brands Across India, Instantly.
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base max-w-2xl mx-auto">
              Compare deals, check real-time stock, and get personalized recommendations across Amazon India, Flipkart, Myntra, and Nykaa with our AI support bot.
            </p>
          </div>
        </section>
      )}

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        
        {showWishlist ? (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" /> My Wishlist
              </h2>
              <p className="text-sm text-slate-500 mt-1">Saved items from all platforms in one place.</p>
            </div>
            <button 
              onClick={() => setShowWishlist(false)} 
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && !showWishlist ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm">Loading catalog...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            {showWishlist ? "Your wishlist is empty. Tap the heart on any product to save it here!" : "No products found in this category."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                isWishlisted={wishlist.some(w => w.id === prod.id)}
                onToggleWishlist={() => toggleWishlist(prod)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        © 2026 BazaarAI • Built with FastAPI, Supabase, and Open-Source LLMs for the Indian E-Commerce Market.
      </footer>

      <ChatWidget wishlist={wishlist} toggleWishlist={toggleWishlist} />
    </div>
  );
}