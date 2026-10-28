import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
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
  themeMode = 'obsidian'
}) {
  // 'closed' | 'minimized' | 'normal' | 'maximized'
  const [windowState, setWindowState] = useState('normal');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
          history: historyPayload
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
            'Our Render AI server is waking up from sleep mode. Please wait 15 seconds and send your message again!',
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 1. CLOSED FLOATING LAUNCHER BUTTON
  if (windowState === 'closed') {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setWindowState('normal')}
          className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-black px-5 py-3.5 rounded-full shadow-2xl shadow-[#D4AF37]/30 flex items-center gap-2.5 font-bold text-sm transition-transform hover:scale-105 cursor-pointer border border-white/40"
        >
          <Sparkles className="w-4 h-4" />
          <span>Khogo AI Concierge</span>
        </button>
      </div>
    );
  }

  // 2. MINIMIZED DOCKED PILL BAR
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <div className="bg-[#0B0B0E]/95 backdrop-blur-xl border border-[#D4AF37]/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
          <div
            onClick={() => setWindowState('normal')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="font-harmond text-lg font-bold text-[#D4AF37]">
              Khogo AI Concierge
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              (Minimized)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWindowState('normal')}
              title="Restore Window"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-[#D4AF37] cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWindowState('closed')}
              title="Close"
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

  // 3. NORMAL OR FULL-SCREEN MAXIMIZED WINDOW
  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isMax
          ? 'inset-3 sm:inset-6'
          : 'bottom-5 right-5 w-[390px] sm:w-[440px] h-[610px]'
      }`}
    >
      <div className="w-full h-full bg-[#0B0B0E]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-[#D4AF37]/40 flex flex-col overflow-hidden text-zinc-100">
        {/* Luxury Obsidian & Gold Top Bar with Minimize / Maximize / Close */}
        <div className="bg-gradient-to-r from-[#141419] via-[#221D12] to-[#141419] border-b border-[#D4AF37]/30 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6D1B] flex items-center justify-center text-black shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-harmond text-xl font-bold tracking-wide text-[#F3E5AB] leading-none">
                Khogo AI Concierge
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Price & Graph Intelligence
              </div>
            </div>
          </div>

          {/* Window Controls: Clear, Minimize, Maximize/Restore, Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Reset Conversation"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWindowState('minimized')}
              title="Minimize Chat"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWindowState(isMax ? 'normal' : 'maximized')}
              title={isMax ? 'Restore Standard Size' : 'Maximize Fullscreen'}
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              {isMax ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setWindowState('closed')}
              title="Close Chat"
              className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#08080B]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`${isMax ? 'max-w-[75%]' : 'max-w-[85%]'} space-y-3`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B68D2C] text-black font-medium rounded-br-none shadow-md'
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
              <span>Scanning live prices across Amazon, Flipkart, Myntra & Nykaa...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
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

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 bg-[#0B0B0E] border-t border-[#D4AF37]/20 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask to compare prices, view graphs, or find deals..."
            className="flex-1 text-sm bg-zinc-900/90 border border-white/10 px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4AF37] text-white placeholder-zinc-500"
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