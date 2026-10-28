import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';

const QUICK_PROMPTS = [
  'Sneakers under ₹5000',
  'Skincare on Nykaa',
  'Noise cancelling headphones',
  'Return policy?'
];

export default function ChatWidget({ wishlist = [], toggleWishlist }) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Namaste! 🙏 I am BazaarAI, your shopping assistant. Ask me to find products across Amazon India, Flipkart, Myntra, and Nykaa, check stock, or answer policy questions!',
      products: []
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

      // Pointing to live Render URL
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
          content: 'Oops! Could not connect to the backend server. Make sure the Render URL is live.',
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-full shadow-xl flex items-center gap-2.5 font-semibold transition-transform hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Ask BazaarAI</span>
        </button>
      ) : (
        <div className="w-[380px] sm:w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">BazaarAI Assistant</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Amazon • Flipkart • Myntra • Nykaa
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="max-w-[82%] space-y-2.5">
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.products && msg.products.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                      {msg.products.map((prod) => (
                        <ProductCard 
                          key={prod.id} 
                          product={prod} 
                          compact={true} 
                          isWishlisted={wishlist.some(w => w.id === prod.id)}
                          onToggleWishlist={() => toggleWishlist && toggleWishlist(prod)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Searching live catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, prices, or policies..."
              className="flex-1 text-sm bg-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}