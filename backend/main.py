import os
import json
import re
import time
import urllib.parse
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Query, Request, HTTPException
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

MODEL_CHAIN = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]

# 3. Initialize FastAPI App
app = FastAPI(
    title="Khojo AI Backend API",
    description="Crash-proof Indian E-Commerce AI Assistant, Link Resolver & Issue Reporter",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. In-Memory Spam & Rate Limit Protection
RATE_LIMIT_STORE: Dict[str, List[float]] = {}

def check_rate_limit(client_ip: str, max_requests: int = 15, window_sec: int = 60) -> bool:
    now = time.time()
    timestamps = RATE_LIMIT_STORE.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < window_sec]
    if len(timestamps) >= max_requests:
        RATE_LIMIT_STORE[client_ip] = timestamps
        return False
    timestamps.append(now)
    RATE_LIMIT_STORE[client_ip] = timestamps
    return True

# 5. Pydantic Schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    website_hp: Optional[str] = ""

class ChatResponse(BaseModel):
    reply: str
    products: List[Dict[str, Any]] = []
    mode_used: str = "ai_agent"

class IssueReportRequest(BaseModel):
    product_id: Optional[str] = ""
    product_name: str
    platform: Optional[str] = "General"
    issue_type: str
    correct_info: str
    user_contact: Optional[str] = ""
    website_hp: Optional[str] = ""

# 6. Store Policies
STORE_POLICIES = {
    "return": "All items across Amazon India, Flipkart, Myntra, and Nykaa via Khojo AI support a 7-Day Easy Return & Exchange policy for unused items with original tags.",
    "shipping": "Free standard delivery across India on orders above ₹499. Express delivery takes 1-3 business days in metro cities.",
    "payment": "We support UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Cash on Delivery (COD) on eligible pin codes.",
    "authenticity": "100% Verified Original Brands. All electronics come with standard manufacturer warranty across India."
}

# 7. Product Search Helpers
def normalize_tags(raw_tags: Any) -> str:
    if isinstance(raw_tags, list):
        return " ".join(str(t) for t in raw_tags)
    if isinstance(raw_tags, str):
        return raw_tags.replace("{", "").replace("}", "").replace('"', "").replace(",", " ")
    return ""

def score_products_by_keywords(items: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    if not query or not query.strip():
        return items

    query_clean = re.sub(r"[^\w\s]", " ", query.lower())
    stop_words = {
        "find", "me", "a", "an", "the", "under", "below", "on", "in", "for",
        "with", "and", "or", "show", "some", "best", "good", "buy", "want",
        "need", "looking", "search", "rs", "inr", "rupees", "from", "to", "compare"
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
        if any(k in ["shoe", "shoes", "sneaker", "sneakers", "running", "footwear", "clogs", "boots"] for k in keywords) and cat_lower == "footwear":
            score += 3
        if any(k in ["hoodie", "shirt", "tshirt", "kurta", "jeans", "cargo", "cargos", "jacket", "blazer", "apparel", "clothing"] for k in keywords) and cat_lower == "apparel":
            score += 3
        if any(k in ["skin", "skincare", "cleanser", "serum", "face", "lipstick", "makeup", "sunscreen", "moisturizer", "beauty", "nykaa", "oily", "dry"] for k in keywords) and cat_lower == "beauty":
            score += 3
        if any(k in ["mouse", "headphone", "headphones", "earphone", "earbuds", "speaker", "keyboard", "ssd", "powerbank", "noise", "cancelling", "tech", "gaming", "electronics"] for k in keywords) and cat_lower == "electronics":
            score += 3
        if any(k in ["watch", "watches", "sunglasses", "bag", "backpack", "wallet", "trolley", "tumbler", "accessories"] for k in keywords) and cat_lower == "accessories":
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

        if query and query.strip():
            ranked = score_products_by_keywords(items, query)
            return ranked[:8]

        return items[:200]

    except Exception as e:
        print(f"Supabase Search Error: {e}")
        return []

def extract_filters_from_text(text: str) -> Dict[str, Any]:
    text_lower = text.lower()

    max_price = None
    price_match = re.search(r"(?:under|below|less than|budget|max|₹|rs\.?\s*)\s*(\d{3,6})", text_lower)
    if price_match:
        max_price = float(price_match.group(1))

    platform = None
    for plat in ["myntra", "flipkart", "nykaa", "amazon"]:
        if plat in text_lower:
            platform = "Amazon India" if plat == "amazon" else plat.capitalize()
            break

    category = None
    if any(w in text_lower for w in ["shoe", "shoes", "sneaker", "sneakers", "footwear", "boot", "boots", "clog", "clogs"]):
        category = "footwear"
    elif any(w in text_lower for w in ["hoodie", "shirt", "tshirt", "kurta", "saree", "apparel", "jeans", "cargo", "cargos", "jacket", "blazer"]):
        category = "apparel"
    elif any(w in text_lower for w in ["skin", "skincare", "serum", "cleanser", "face wash", "sunscreen", "moisturizer", "lipstick", "foundation", "makeup", "beauty"]):
        category = "beauty"
    elif any(w in text_lower for w in ["mouse", "headphone", "headphones", "earbud", "earbuds", "speaker", "keyboard", "ssd", "power bank", "powerbank", "electronics", "gaming", "noise cancelling"]):
        category = "electronics"
    elif any(w in text_lower for w in ["bag", "backpack", "tote", "trolley", "wallet", "watch", "watches", "sunglass", "sunglasses", "tumbler", "accessories"]):
        category = "accessories"

    return {
        "max_price": max_price,
        "platform": platform,
        "category": category
    }

# 8. API Endpoints
@app.get("/")
def health_check():
    return {"status": "online", "service": "Khojo AI Backend v3.0"}

@app.get("/api/products")
def get_catalog_products(
    category: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None)
):
    products = search_supabase_products(
        category=category,
        platform=platform,
        max_price=max_price
    )
    return {"products": products, "count": len(products)}

@app.post("/api/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest, request: Request):
    if req.website_hp and req.website_hp.strip() != "":
        return ChatResponse(reply="Spam detected.", products=[], mode_used="spam_shield")

    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"chat:{client_ip}", max_requests=15, window_sec=60):
        return ChatResponse(
            reply="⏳ You are sending messages too quickly! Please wait a few seconds before asking another question.",
            products=[],
            mode_used="rate_limiter"
        )

    user_msg = req.message.strip()[:500]
    msg_lower = user_msg.lower()

    if any(k in msg_lower for k in ["return", "refund", "exchange", "policy", "shipping", "delivery", "cod", "payment"]):
        policy_info = "\n".join([f"- **{k.capitalize()}**: {v}" for k, v in STORE_POLICIES.items()])
        return ChatResponse(
            reply=f"Here are our official Khojo AI customer support policies:\n\n{policy_info}\n\nHow else can I help you shop today?",
            products=[],
            mode_used="policy_engine"
        )

    filters = extract_filters_from_text(user_msg)

    matched_products = search_supabase_products(
        query=user_msg,
        category=filters["category"],
        platform=filters["platform"],
        max_price=filters["max_price"]
    )

    if not matched_products and filters["category"]:
        matched_products = search_supabase_products(
            query=user_msg,
            category=filters["category"],
            max_price=filters["max_price"]
        )

    if not matched_products and (filters["category"] or filters["platform"]):
        matched_products = search_supabase_products(
            query=user_msg,
            category=filters["category"],
            platform=filters["platform"]
        )

    if not matched_products:
        matched_products = search_supabase_products(query=user_msg)

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
        "You are Khojo AI, India's smart luxury shopping concierge covering Amazon India, Flipkart, Myntra, and Nykaa. "
        "Keep your response friendly, concise (2-3 sentences max), and helpful. Use ₹ for prices. "
        "Briefly highlight the best options from the matching products below, and remind the user they can click 'Compare' to view 6-month price history or click 'Buy Now' to open the store.\n\n"
        f"Matching Catalog Products:\n{product_context}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for h in (req.history or [])[-4:]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": user_msg})

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
                print(f"Model {model_name} failed: {e}")
                continue

    if matched_products:
        top = matched_products[0]
        reply_text = (
            f"I found **{len(matched_products)} great options** for you! "
            f"The top pick is the **{top.get('name')}** by {top.get('brand')} on **{top.get('platform')}** for **₹{top.get('price_inr')}**. "
            "Tap **Compare** to inspect the 6-month price history or click **Buy Now**!"
        )
    else:
        reply_text = "I couldn't find an exact match for that filter right now. Try browsing our Footwear, Beauty, Electronics, or Apparel categories!"

    return ChatResponse(
        reply=reply_text,
        products=matched_products,
        mode_used="tier3_sql_safe_mode"
    )

# 9. Database Fix / Issue Reporter Endpoints
FALLBACK_REPORTS_LOG: List[Dict[str, Any]] = []

@app.post("/api/report")
def submit_product_fix_report(report: IssueReportRequest, request: Request):
    if report.website_hp and report.website_hp.strip() != "":
        return {"status": "ignored", "message": "Bot spam blocked."}

    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"report:{client_ip}", max_requests=5, window_sec=60):
        raise HTTPException(status_code=429, detail="Too many reports submitted. Please wait a minute.")

    clean_info = report.correct_info.strip()
    if len(clean_info) < 4:
        raise HTTPException(status_code=400, detail="Please provide valid details so we can fix the issue.")

    payload = {
        "product_id": str(report.product_id or ""),
        "product_name": report.product_name.strip()[:200],
        "platform": (report.platform or "General").strip()[:60],
        "issue_type": report.issue_type.strip()[:60],
        "correct_info": clean_info[:1000],
        "user_contact": (report.user_contact or "").strip()[:120],
        "status": "pending"
    }

    try:
        res = supabase.table("issue_reports").insert(payload).execute()
        return {
            "status": "success",
            "message": "Report saved to Supabase database! Our team will verify and update this listing.",
            "data": res.data
        }
    except Exception as e:
        print(f"Supabase issue_reports insert fallback: {e}")
        FALLBACK_REPORTS_LOG.append(payload)
        return {
            "status": "logged",
            "message": "Report logged successfully! Thank you for helping keep Khojo AI accurate."
        }

@app.get("/api/reports")
def list_submitted_reports():
    try:
        res = supabase.table("issue_reports").select("*").order("created_at", desc=True).limit(25).execute()
        return {"reports": res.data or []}
    except Exception:
        return {"reports": FALLBACK_REPORTS_LOG}

@app.post("/api/admin/resolve-report")
def resolve_issue_report(report_id: str, action: str = "approve"):
    try:
        if action == "approve":
            supabase.table("issue_reports").update({"status": "resolved"}).eq("id", report_id).execute()
            return {"status": "success", "message": "Report approved and marked as resolved in Supabase!"}
        else:
            supabase.table("issue_reports").delete().eq("id", report_id).execute()
            return {"status": "success", "message": "Report dismissed and removed."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 10. Real-Time Live Product Link Resolver
PLATFORM_CONFIG = {
    "myntra": {
        "domain": "myntra.com",
        "is_product_page": lambda url: "/buy" in url,
        "fallback": lambda q: f"https://www.myntra.com/{urllib.parse.quote(re.sub(r'[^a-zA-Z0-9\s]', '', q).strip().replace(' ', '-').lower())}?rawQuery={urllib.parse.quote(q)}"
    },
    "flipkart": {
        "domain": "flipkart.com",
        "is_product_page": lambda url: "/p/" in url or "pid=" in url,
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

RESOLVED_LINK_CACHE: Dict[str, str] = {}

@app.get("/api/redirect")
def resolve_live_product_link(
    name: str = Query(..., description="Product Name"),
    brand: str = Query("", description="Brand Name"),
    platform: str = Query("Amazon India", description="E-Commerce Platform")
):
    plat_key = platform.lower().strip()
    if "amazon" in plat_key:
        plat_key = "amazon india"
    elif "flipkart" in plat_key:
        plat_key = "flipkart"
    elif "nykaa" in plat_key:
        plat_key = "nykaa"
    elif "myntra" in plat_key:
        plat_key = "myntra"

    config = PLATFORM_CONFIG.get(plat_key, PLATFORM_CONFIG["amazon india"])

    clean_name = re.sub(r"[^\w\s\-]", " ", name).strip()
    clean_brand = re.sub(r"[^\w\s\-]", " ", brand).strip()
    clean_query = f"{clean_brand} {clean_name}".strip() if clean_brand.lower() not in clean_name.lower() else clean_name

    cache_key = f"{plat_key}:{clean_query.lower()}"
    if cache_key in RESOLVED_LINK_CACHE:
        return RedirectResponse(url=RESOLVED_LINK_CACHE[cache_key], status_code=302)

    try:
        with DDGS() as ddgs:
            ddg_query = f"site:{config['domain']} {clean_query}"
            results = list(ddgs.text(ddg_query, region="in-en", max_results=5))
            for r in results:
                href = r.get("href", "")
                if href.startswith("http") and config["domain"] in href and config["is_product_page"](href):
                    RESOLVED_LINK_CACHE[cache_key] = href
                    return RedirectResponse(url=href, status_code=302)
    except Exception as e:
        print(f"DuckDuckGo resolution fallback for {clean_query}: {e}")

    fallback_url = config["fallback"](clean_query)
    RESOLVED_LINK_CACHE[cache_key] = fallback_url
    return RedirectResponse(url=fallback_url, status_code=302)