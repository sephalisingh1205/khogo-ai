import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  Minus,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import ProductCard from './ProductCard';

const QUICK_PROMPTS = [
  'Sneakers under ₹5000',
  'Skincare on Nykaa',
  'Noise cancelling headphones',
  'Compare luxury watches',
  'Return policy?'
];

export default function ChatWidget({
  wishlist = [],
  toggleWishlist,
  onOpenAnalytics,
  onOpenReporter,
  themeMode = 'obsidian'
}) {
  // Start minimized on small mobile screens so it never blocks the initial view
  const [windowState, setWindowState] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'closed' : 'normal'
  );
  const [input, setInput] = useState('');
  const [websiteHp, setWebsiteHp] = useState(''); // Hidden Honeypot
  const [loading, setLoading] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Namaste! ✨ Welcome to Khogo AI Luxury Concierge. Ask me to compare live prices across Amazon India, Flipkart, Myntra & Nykaa, inspect 6-month price graphs, or find the highest Deal Score steals!',
      products: []
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (windowState === 'normal' || windowState === 'maximized') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, windowState]);

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Chat history cleared! ✨ Tell me what product, brand, or budget you want me to scan across India today.',
        products: []
      }
    ]);
  };

  const sendMessage = async (textToSend) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    // Anti-spam 2-second cooldown
    const now = Date.now();
    if (now - lastSentTime < 2000) {
      return;
    }
    setLastSentTime(now);

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('https://khogo-ai.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          website_hp: websiteHp
        })
      });

      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          products: data.products || []
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Our Render AI server is waking up from sleep mode. Please wait 10 seconds and try your message again!',
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (windowState === 'closed') {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
        <button
          onClick={() => setWindowState('normal')}
          className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-cyan-400 text-black px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-2xl shadow-[#D4AF37]/30 flex items-center gap-2 font-bold text-xs sm:text-sm transition-transform hover:scale-105 cursor-pointer border border-white/40"
        >
          <Sparkles className="w-4 h-4" />
          <span>Khogo AI Concierge</span>
        </button>
      </div>
    );
  }

  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
        <div className="bg-[#0B0B0E]/95 backdrop-blur-xl border border-[#D4AF37]/60 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
          <div
            onClick={() => setWindowState('normal')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="font-harmond text-lg font-bold text-[#D4AF37]">
              Khogo AI Concierge
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWindowState('normal')}
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-[#D4AF37] cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWindowState('closed')}
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-rose-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMax = windowState === 'maximized';

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isMax
          ? 'inset-2 sm:inset-6'
          : 'bottom-3 right-3 left-3 sm:left-auto sm:bottom-5 sm:right-5 sm:w-[430px] h-[78vh] sm:h-[600px]'
      }`}
    >
      <div className="w-full h-full bg-[#0B0B0E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#D4AF37]/40 flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#141419] via-[#221D12] to-[#141419] border-b border-[#D4AF37]/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#D4AF37]/60 shrink-0">
              <img src="/favicon.ico" alt="AI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-harmond text-lg sm:text-xl font-bold tracking-wide text-[#F3E5AB] leading-none">
                Khogo AI Concierge
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Spam-Protected • Live Price Engine
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Reset Chat"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#D4AF37] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWindowState('minimized')}
              title="Minimize"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#D4AF37] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWindowState(isMax ? 'normal' : 'maximized')}
              title="Maximize"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#D4AF37] cursor-pointer"
            >
              {isMax ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setWindowState('closed')}
              title="Close"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-rose-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-[#08080B]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`${isMax ? 'max-w-[80%]' : 'max-w-[86%]'} space-y-2.5`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B68D2C] text-black font-semibold rounded-br-none'
                      : 'bg-zinc-900/90 text-zinc-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.products && msg.products.length > 0 && (
                  <div
                    className={`flex gap-3 overflow-x-auto pb-2 pt-1 ${
                      isMax ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-x-visible' : ''
                    }`}
                  >
                    {msg.products.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        compact={!isMax}
                        isWishlisted={wishlist.some((w) => w.id === prod.id)}
                        onToggleWishlist={() => toggleWishlist && toggleWishlist(prod)}
                        onOpenAnalytics={onOpenAnalytics}
                        onOpenReporter={onOpenReporter}
                        themeMode={themeMode}
                      />
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] pl-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning live prices across India...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-[#0E0E12] border-t border-white/10 flex gap-2 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs bg-zinc-900 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 text-zinc-300 hover:text-[#F3E5AB] px-3 py-1.5 rounded-full whitespace-nowrap transition-all shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form with Hidden Honeypot */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-2.5 sm:p-3 bg-[#0B0B0E] border-t border-[#D4AF37]/20 flex items-center gap-2"
        >
          <input
            type="text"
            name="website_hp"
            value={websiteHp}
            onChange={(e) => setWebsiteHp(e.target.value)}
            tabIndex="-1"
            autoComplete="off"
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask to compare prices or find deals..."
            className="flex-1 text-xs sm:text-sm bg-zinc-900/90 border border-white/10 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#D4AF37] text-white placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B68D2C] hover:brightness-110 disabled:opacity-40 text-black p-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}