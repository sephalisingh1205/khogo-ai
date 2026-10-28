import os
import json
import re
import urllib.parse
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
from duckduckgo_search import DDGS

# 1. Load Environment Variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in .env file!")

# 2. Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

llm_client = OpenAI(
    api_key=GROQ_API_KEY or "missing_key",
    base_url="https://api.groq.com/openai/v1"
)

# Open-Source Model Fallback Chain on Groq
MODEL_CHAIN = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]

# 3. Initialize FastAPI App
app = FastAPI(
    title="BazaarAI Backend API",
    description="Crash-proof Indian E-Commerce AI Assistant & Real-Time Link Resolver",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Pydantic Request/Response Schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    products: List[Dict[str, Any]] = []
    mode_used: str = "ai_agent"

# 5. Store Policies & Knowledge Base
STORE_POLICIES = {
    "return": "All items across Amazon India, Flipkart, Myntra, and Nykaa via BazaarAI support a 7-Day Easy Return & Exchange policy for unused items with original tags.",
    "shipping": "Free standard delivery across India on orders above ₹499. Express delivery takes 1-3 business days in metro cities.",
    "payment": "We support UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Cash on Delivery (COD) on eligible pin codes.",
    "authenticity": "100% Verified Original Brands. All electronics come with standard manufacturer warranty across India."
}

# 6. Helper Functions for Product Search
def normalize_tags(raw_tags: Any) -> str:
    """Safely converts Postgres array or string tags into a flat lowercase string."""
    if isinstance(raw_tags, list):
        return " ".join(str(t) for t in raw_tags)
    if isinstance(raw_tags, str):
        return raw_tags.replace("{", "").replace("}", "").replace('"', "").replace(",", " ")
    return ""

def score_products_by_keywords(items: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    """Scores and ranks a list of products against natural language query keywords."""
    if not query or not query.strip():
        return items

    query_clean = re.sub(r"[^\w\s]", " ", query.lower())
    stop_words = {
        "find", "me", "a", "an", "the", "under", "below", "on", "in", "for",
        "with", "and", "or", "show", "some", "best", "good", "buy", "want",
        "need", "looking", "search", "rs", "inr", "rupees", "from", "to"
    }
    keywords = [
        w for w in query_clean.split()
        if w not in stop_words and not w.isdigit() and len(w) > 2
    ]

    if not keywords:
        return items

    scored_items = []
    for item in items:
        tags_str = normalize_tags(item.get("tags"))
        searchable_text = " ".join([
            str(item.get("name", "")),
            str(item.get("brand", "")),
            str(item.get("category", "")),
            str(item.get("platform", "")),
            tags_str
        ]).lower()

        score = 0
        for kw in keywords:
            if kw in searchable_text:
                score += 2
            elif kw.endswith("s") and len(kw) > 3 and kw[:-1] in searchable_text:
                score += 2

        cat_lower = str(item.get("category", "")).lower()
        # Category Synonym Boosts
        if any(k in ["shoe", "shoes", "sneaker", "sneakers", "running", "footwear", "clogs", "boots"] for k in keywords) and cat_lower == "footwear":
            score += 3
        if any(k in ["hoodie", "shirt", "tshirt", "kurta", "jeans", "cargo", "cargos", "jacket", "blazer", "apparel", "clothing"] for k in keywords) and cat_lower == "apparel":
            score += 3
        if any(k in ["skin", "skincare", "cleanser", "serum", "face", "lipstick", "makeup", "sunscreen", "moisturizer", "beauty", "nykaa", "oily", "dry"] for k in keywords) and cat_lower == "beauty":
            score += 3
        if any(k in ["mouse", "headphone", "headphones", "earphone", "earbuds", "speaker", "keyboard", "ssd", "powerbank", "noise", "cancelling", "tech", "gaming", "electronics"] for k in keywords) and cat_lower == "electronics":
            score += 3
        if any(k in ["watch", "sunglasses", "bag", "backpack", "wallet", "trolley", "tumbler", "accessories"] for k in keywords) and cat_lower == "accessories":
            score += 3

        if score > 0:
            scored_items.append((score, item))

    if scored_items:
        scored_items.sort(key=lambda x: (x[0], float(x[1].get("rating") or 0)), reverse=True)
        return [item for _, item in scored_items]

    return items

def search_supabase_products(
    query: str = "",
    category: Optional[str] = None,
    platform: Optional[str] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False
) -> List[Dict[str, Any]]:
    """Queries Supabase products table with multi-tier fallback so chat searches never fail."""
    try:
        req = supabase.table("products").select("*")

        if category and category.lower() != "all":
            req = req.ilike("category", f"%{category.strip()}%")

        if platform and platform.lower() != "all":
            req = req.ilike("platform", f"%{platform.strip()}%")

        if max_price is not None and max_price > 0:
            req = req.lte("price_inr", max_price)

        if in_stock_only:
            req = req.eq("in_stock", True)

        response = req.execute()
        items = response.data or []

        # If a natural language query was passed (from ChatWidget), rank and return top 8
        if query and query.strip():
            ranked = score_products_by_keywords(items, query)
            return ranked[:8]

        # Otherwise (for the main storefront grid), return up to 60 items
        return items[:60]

    except Exception as e:
        print(f"❌ Supabase Search Error: {e}")
        return []

def extract_filters_from_text(text: str) -> Dict[str, Any]:
    """Extracts budget, platform, and category directly from raw user text."""
    text_lower = text.lower()

    # 1. Extract budget (e.g., "under 5000", "below ₹2000")
    max_price = None
    price_match = re.search(r"(?:under|below|less than|budget|max|₹|rs\.?\s*)\s*(\d{3,6})", text_lower)
    if price_match:
        max_price = float(price_match.group(1))

    # 2. Extract platform
    platform = None
    for plat in ["myntra", "flipkart", "nykaa", "amazon"]:
        if plat in text_lower:
            platform = "Amazon India" if plat == "amazon" else plat.capitalize()
            break

    # 3. Extract category
    category = None
    if any(w in text_lower for w in ["shoe", "shoes", "sneaker", "sneakers", "footwear", "boot", "boots", "clog", "clogs"]):
        category = "footwear"
    elif any(w in text_lower for w in ["hoodie", "shirt", "tshirt", "kurta", "saree", "apparel", "jeans", "cargo", "cargos", "jacket", "blazer"]):
        category = "apparel"
    elif any(w in text_lower for w in ["skin", "skincare", "serum", "cleanser", "face wash", "sunscreen", "moisturizer", "lipstick", "foundation", "makeup", "beauty"]):
        category = "beauty"
    elif any(w in text_lower for w in ["mouse", "headphone", "headphones", "earbud", "earbuds", "speaker", "keyboard", "ssd", "power bank", "powerbank", "electronics", "gaming", "noise cancelling"]):
        category = "electronics"
    elif any(w in text_lower for w in ["bag", "backpack", "tote", "trolley", "wallet", "watch", "sunglass", "sunglasses", "tumbler", "accessories"]):
        category = "accessories"

    return {
        "max_price": max_price,
        "platform": platform,
        "category": category
    }

# =====================================================================
# 7. API ENDPOINTS
# =====================================================================

@app.get("/")
def health_check():
    return {"status": "online", "service": "BazaarAI Backend v2.1"}

@app.get("/api/products")
def get_catalog_products(
    category: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None)
):
    """Fetches products for the main storefront grid."""
    products = search_supabase_products(
        category=category,
        platform=platform,
        max_price=max_price
    )
    return {"products": products, "count": len(products)}

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest):
    """3-Tier Crash-Proof AI Shopping & Support Assistant."""
    user_msg = req.message.strip()
    msg_lower = user_msg.lower()

    # Check if user is asking about policies
    if any(k in msg_lower for k in ["return", "refund", "exchange", "policy", "shipping", "delivery", "cod", "payment"]):
        policy_info = "\n".join([f"- **{k.capitalize()}**: {v}" for k, v in STORE_POLICIES.items()])
        return ChatResponse(
            reply=f"Here are our official BazaarAI customer support policies:\n\n{policy_info}\n\nHow else can I help you shop today?",
            products=[],
            mode_used="policy_engine"
        )

    # Extract filters & fetch matching products from Supabase with multi-step fallback
    filters = extract_filters_from_text(user_msg)

    # Pass 1: Strict filter (category + platform + max_price + keywords)
    matched_products = search_supabase_products(
        query=user_msg,
        category=filters["category"],
        platform=filters["platform"],
        max_price=filters["max_price"]
    )

    # Pass 2: Relax platform filter if 0 results
    if not matched_products and filters["category"]:
        matched_products = search_supabase_products(
            query=user_msg,
            category=filters["category"],
            max_price=filters["max_price"]
        )

    # Pass 3: Relax max_price if still 0 results
    if not matched_products and (filters["category"] or filters["platform"]):
        matched_products = search_supabase_products(
            query=user_msg,
            category=filters["category"],
            platform=filters["platform"]
        )

    # Pass 4: Pure keyword search across entire catalog
    if not matched_products:
        matched_products = search_supabase_products(query=user_msg)

    # Prepare context for Groq LLM
    product_context = json.dumps([
        {
            "name": p.get("name"),
            "brand": p.get("brand"),
            "platform": p.get("platform"),
            "price_inr": p.get("price_inr"),
            "in_stock": p.get("in_stock"),
            "rating": p.get("rating")
        }
        for p in matched_products
    ], indent=2)

    system_prompt = (
        "You are BazaarAI, India's smart e-commerce shopping assistant covering Amazon India, Flipkart, Myntra, and Nykaa. "
        "Keep your response friendly, concise (2-3 sentences max), and helpful. Use ₹ for prices. "
        "Briefly highlight the best options from the matching products below, and remind the user they can click the Heart icon to save items to their Wishlist or click 'Buy' to open the live store page.\n\n"
        f"Matching Catalog Products:\n{product_context}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for h in (req.history or [])[-4:]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": user_msg})

    # Try Open-Source Models on Groq
    if GROQ_API_KEY:
        for model_name in MODEL_CHAIN:
            try:
                completion = llm_client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.5,
                    max_tokens=250
                )
                ai_reply = completion.choices[0].message.content
                return ChatResponse(
                    reply=ai_reply,
                    products=matched_products,
                    mode_used=model_name
                )
            except Exception as e:
                print(f"⚠️ Model {model_name} failed: {e}")
                continue

    # Tier-3 SQL Safe Mode Fallback (Works even if Groq API is offline)
    if matched_products:
        top = matched_products[0]
        reply_text = (
            f"I found **{len(matched_products)} great options** for you! "
            f"The top pick is the **{top.get('name')}** by {top.get('brand')} on **{top.get('platform')}** for **₹{top.get('price_inr')}**. "
            "Tap the ❤️ icon to save items to your Wishlist or click **Buy** to open the live product page!"
        )
    else:
        reply_text = "I couldn't find an exact match for that filter in our catalog right now. Try browsing our Footwear, Beauty, Electronics, or Apparel categories!"

    return ChatResponse(
        reply=reply_text,
        products=matched_products,
        mode_used="tier3_sql_safe_mode"
    )

# =====================================================================
# 8. REAL-TIME "BUYHATKE" LIVE PRODUCT LINK RESOLVER
# =====================================================================

PLATFORM_CONFIG = {
    "myntra": {
        "domain": "myntra.com",
        "is_product_page": lambda url: "/buy" in url,
        "fallback": lambda q: f"https://www.myntra.com/{urllib.parse.quote(q.replace(' ', '-'))}?rawQuery={urllib.parse.quote(q)}"
    },
    "flipkart": {
        "domain": "flipkart.com",
        "is_product_page": lambda url: "/p/" in url,
        "fallback": lambda q: f"https://www.flipkart.com/search?q={urllib.parse.quote_plus(q)}"
    },
    "amazon india": {
        "domain": "amazon.in",
        "is_product_page": lambda url: "/dp/" in url or "/gp/product/" in url,
        "fallback": lambda q: f"https://www.amazon.in/s?k={urllib.parse.quote_plus(q)}"
    },
    "nykaa": {
        "domain": "nykaa.com",
        "is_product_page": lambda url: "/p/" in url,
        "fallback": lambda q: f"https://www.nykaa.com/search/result/?q={urllib.parse.quote_plus(q)}"
    }
}

# In-memory cache so clicking the same product twice is instant (0ms)
RESOLVED_LINK_CACHE: Dict[str, str] = {}

@app.get("/api/redirect")
def resolve_live_product_link(
    name: str = Query(..., description="Product Name"),
    brand: str = Query("", description="Brand Name"),
    platform: str = Query("Myntra", description="E-Commerce Platform")
):
    """
    Real-Time 'BuyHatke' Engine:
    Finds the exact live product page URL on Myntra, Flipkart, Amazon India, or Nykaa
    in real-time without getting blocked by Cloudflare/Akamai.
    """
    cache_key = f"{platform.lower()}:{brand.lower()}:{name.lower()}"
    if cache_key in RESOLVED_LINK_CACHE:
        print(f"⚡ [Cache Hit] Redirecting {name} -> {RESOLVED_LINK_CACHE[cache_key]}")
        return RedirectResponse(url=RESOLVED_LINK_CACHE[cache_key])

    plat_key = platform.lower().strip()
    config = PLATFORM_CONFIG.get(plat_key, PLATFORM_CONFIG["myntra"])
    clean_query = f"{brand} {name}".strip() if brand.lower() not in name.lower() else name.strip()

    ddg_query = f"site:{config['domain']} {clean_query}"

    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(ddg_query, region="in-en", max_results=6))

            # Pass 1: Find an exact verified product page URL (/buy, /p/, /dp/)
            for r in results:
                href = r.get("href", "")
                if config["domain"] in href and config["is_product_page"](href):
                    RESOLVED_LINK_CACHE[cache_key] = href
                    print(f"✅ [Live Resolved] {clean_query} -> {href}")
                    return RedirectResponse(url=href)

            # Pass 2: Broader search if strict site: operator returned no direct product link
            broad_results = list(ddgs.text(f"{config['domain']} {clean_query} buy online india", region="in-en", max_results=6))
            for r in broad_results:
                href = r.get("href", "")
                if config["domain"] in href and config["is_product_page"](href):
                    RESOLVED_LINK_CACHE[cache_key] = href
                    print(f"✅ [Broad Live Resolved] {clean_query} -> {href}")
                    return RedirectResponse(url=href)

    except Exception as e:
        print(f"⚠️ DuckDuckGo live resolution warning for {clean_query}: {e}")

    # Pass 3: Specific Product Search Fallback on the target platform
    fallback_url = config["fallback"](clean_query)
    print(f"🔄 [Direct Search Fallback] {clean_query} -> {fallback_url}")
    return RedirectResponse(url=fallback_url)