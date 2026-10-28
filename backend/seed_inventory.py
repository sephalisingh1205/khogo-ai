import os
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. Load Supabase Credentials
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in backend/.env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. 50 Curated Products Across Amazon India, Flipkart, Myntra & Nykaa
NEW_PRODUCTS = [
    # ==================== FOOTWEAR (10) ====================
    {
        "name": "Adidas Men Ultraboost Light Running Shoes",
        "brand": "Adidas",
        "category": "footwear",
        "price_inr": 11999,
        "mrp_inr": 18999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500",
        "product_url": "https://www.myntra.com/sports-shoes",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["running", "shoes", "sports", "marathon", "cushion"]
    },
    {
        "name": "Asics Gel-Kayano 30 Men Stability Running Shoes",
        "brand": "Asics",
        "category": "footwear",
        "price_inr": 12499,
        "mrp_inr": 15999,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        "product_url": "https://www.flipkart.com/search?q=asics+gel+kayano",
        "in_stock": True,
        "rating": 4.7,
        "tags": ["running", "shoes", "gym", "stability", "arch support"]
    },
    {
        "name": "Converse Chuck Taylor All Star Classic High Top Sneakers",
        "brand": "Converse",
        "category": "footwear",
        "price_inr": 4299,
        "mrp_inr": 4999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500",
        "product_url": "https://www.myntra.com/casual-shoes",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["sneakers", "casual", "canvas", "high top", "streetwear"]
    },
    {
        "name": "Crocs Unisex Classic Clogs Navy",
        "brand": "Crocs",
        "category": "footwear",
        "price_inr": 2399,
        "mrp_inr": 3495,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500",
        "product_url": "https://www.amazon.in/s?k=crocs+classic+clogs",
        "in_stock": True,
        "rating": 4.5,
        "tags": ["clogs", "sandals", "waterproof", "comfort", "daily"]
    },
    {
        "name": "Skechers Men Go Walk 6 Slip-On Walking Shoes",
        "brand": "Skechers",
        "category": "footwear",
        "price_inr": 4799,
        "mrp_inr": 6499,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500",
        "product_url": "https://www.flipkart.com/search?q=skechers+go+walk+6",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["walking", "slip-on", "comfort", "seniors", "daily"]
    },
    {
        "name": "Woodland Men Camel Leather Outdoor Trekking Boots",
        "brand": "Woodland",
        "category": "footwear",
        "price_inr": 3195,
        "mrp_inr": 4495,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500",
        "product_url": "https://www.amazon.in/s?k=woodland+boots",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["boots", "leather", "trekking", "hiking", "outdoor"]
    },
    {
        "name": "New Balance 574 Core Unisex Lifestyle Sneakers",
        "brand": "New Balance",
        "category": "footwear",
        "price_inr": 6999,
        "mrp_inr": 8999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500",
        "product_url": "https://www.myntra.com/casual-shoes",
        "in_stock": True,
        "rating": 4.7,
        "tags": ["sneakers", "retro", "suede", "casual", "comfort"]
    },
    {
        "name": "Bata Red Label Men Tan Formal Derbys",
        "brand": "Bata",
        "category": "footwear",
        "price_inr": 1499,
        "mrp_inr": 2499,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500",
        "product_url": "https://www.flipkart.com/search?q=bata+formal+shoes",
        "in_stock": True,
        "rating": 4.2,
        "tags": ["formal", "office", "leather", "derby", "budget"]
    },
    {
        "name": "Campus Men Hurricane Running Shoes",
        "brand": "Campus",
        "category": "footwear",
        "price_inr": 999,
        "mrp_inr": 1699,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500",
        "product_url": "https://www.amazon.in/s?k=campus+running+shoes",
        "in_stock": True,
        "rating": 4.1,
        "tags": ["budget", "running", "gym", "under 1000", "shoes"]
    },
    {
        "name": "Puma Men Future Rider Play On Sneakers",
        "brand": "Puma",
        "category": "footwear",
        "price_inr": 3599,
        "mrp_inr": 6999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
        "product_url": "https://www.myntra.com/casual-shoes",
        "in_stock": False,
        "rating": 4.5,
        "tags": ["sneakers", "colorblock", "streetwear", "puma"]
    },

    # ==================== ELECTRONICS (10) ====================
    {
        "name": "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
        "brand": "Sony",
        "category": "electronics",
        "price_inr": 26990,
        "mrp_inr": 34990,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
        "product_url": "https://www.amazon.in/s?k=sony+wh-1000xm5",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["headphones", "anc", "wireless", "bluetooth", "audio"]
    },
    {
        "name": "Apple AirPods Pro 2nd Generation with MagSafe Case USB-C",
        "brand": "Apple",
        "category": "electronics",
        "price_inr": 21999,
        "mrp_inr": 24900,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500",
        "product_url": "https://www.flipkart.com/search?q=airpods+pro+2",
        "in_stock": True,
        "rating": 4.9,
        "tags": ["earbuds", "tws", "apple", "anc", "audio"]
    },
    {
        "name": "boAt Airdopes 141 ANC TWS Earbuds with 42H Playtime",
        "brand": "boAt",
        "category": "electronics",
        "price_inr": 1299,
        "mrp_inr": 4490,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
        "product_url": "https://www.amazon.in/s?k=boat+airdopes+141",
        "in_stock": True,
        "rating": 4.1,
        "tags": ["earbuds", "tws", "budget", "wireless", "audio"]
    },
    {
        "name": "OnePlus Nord Buds 2r True Wireless in-Ear Earbuds",
        "brand": "OnePlus",
        "category": "electronics",
        "price_inr": 1799,
        "mrp_inr": 2299,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        "product_url": "https://www.amazon.in/s?k=oneplus+nord+buds+2r",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["earbuds", "tws", "oneplus", "under 2000", "bass"]
    },
    {
        "name": "Samsung Galaxy Watch 6 Bluetooth 44mm Graphite",
        "brand": "Samsung",
        "category": "electronics",
        "price_inr": 21999,
        "mrp_inr": 33999,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
        "product_url": "https://www.flipkart.com/search?q=samsung+galaxy+watch+6",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["smartwatch", "fitness", "wearable", "android"]
    },
    {
        "name": "JBL Flip 6 Wireless Portable Waterproof Bluetooth Speaker",
        "brand": "JBL",
        "category": "electronics",
        "price_inr": 9999,
        "mrp_inr": 13999,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
        "product_url": "https://www.amazon.in/s?k=jbl+flip+6",
        "in_stock": True,
        "rating": 4.7,
        "tags": ["speaker", "bluetooth", "party", "waterproof", "bass"]
    },
    {
        "name": "Razer DeathAdder Essential Wired Gaming Mouse White",
        "brand": "Razer",
        "category": "electronics",
        "price_inr": 1399,
        "mrp_inr": 4499,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1527814050087-379381547969?w=500",
        "product_url": "https://www.amazon.in/s?k=razer+deathadder+essential",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["mouse", "gaming", "esports", "pc", "under 1500"]
    },
    {
        "name": "Keychron K2 V2 Hot-Swappable Wireless Mechanical Keyboard",
        "brand": "Keychron",
        "category": "electronics",
        "price_inr": 8499,
        "mrp_inr": 10999,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
        "product_url": "https://www.amazon.in/s?k=keychron+k2+v2",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["keyboard", "mechanical", "coding", "gaming", "wireless"]
    },
    {
        "name": "SanDisk 1TB Extreme Portable SSD 1050MB/s USB-C",
        "brand": "SanDisk",
        "category": "electronics",
        "price_inr": 8999,
        "mrp_inr": 15999,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500",
        "product_url": "https://www.flipkart.com/search?q=sandisk+1tb+extreme+ssd",
        "in_stock": True,
        "rating": 4.7,
        "tags": ["ssd", "storage", "backup", "usb-c", "tech"]
    },
    {
        "name": "Mi Power Bank 3i 20000mAh 18W Fast Charging",
        "brand": "Xiaomi",
        "category": "electronics",
        "price_inr": 1999,
        "mrp_inr": 2499,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
        "product_url": "https://www.amazon.in/s?k=mi+power+bank+3i+20000mah",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["powerbank", "charger", "battery", "travel", "under 2000"]
    },

    # ==================== BEAUTY (10) ====================
    {
        "name": "COSRX Advanced Snail 96 Mucin Power Essence 100ml",
        "brand": "COSRX",
        "category": "beauty",
        "price_inr": 1160,
        "mrp_inr": 1450,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=cosrx+snail+mucin",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["skincare", "korean", "hydrating", "essence", "glow"]
    },
    {
        "name": "MAC MACximal Matte Lipstick Ruby Woo",
        "brand": "M.A.C",
        "category": "beauty",
        "price_inr": 2250,
        "mrp_inr": 2550,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=mac+ruby+woo",
        "in_stock": True,
        "rating": 4.9,
        "tags": ["lipstick", "makeup", "red", "matte", "luxury"]
    },
    {
        "name": "Laneige Lip Sleeping Mask Berry 20g",
        "brand": "Laneige",
        "category": "beauty",
        "price_inr": 1190,
        "mrp_inr": 1420,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=laneige+lip+sleeping+mask",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["lip balm", "korean", "hydrating", "skincare", "overnight"]
    },
    {
        "name": "The Ordinary Hyaluronic Acid 2% + B5 Hydrating Serum",
        "brand": "The Ordinary",
        "category": "beauty",
        "price_inr": 850,
        "mrp_inr": 950,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1608248597359-0e6d526a6828?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=the+ordinary+hyaluronic+acid",
        "in_stock": True,
        "rating": 4.7,
        "tags": ["serum", "dry skin", "skincare", "hydrating", "under 1000"]
    },
    {
        "name": "Dot & Key Vitamin C + E Super Bright Sunscreen SPF 50",
        "brand": "Dot & Key",
        "category": "beauty",
        "price_inr": 395,
        "mrp_inr": 495,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=dot+and+key+sunscreen",
        "in_stock": True,
        "rating": 4.5,
        "tags": ["sunscreen", "spf 50", "oily skin", "skincare", "budget"]
    },
    {
        "name": "Maybelline New York Fit Me Matte + Poreless Liquid Foundation",
        "brand": "Maybelline",
        "category": "beauty",
        "price_inr": 449,
        "mrp_inr": 649,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=maybelline+fit+me+foundation",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["foundation", "makeup", "oily skin", "matte", "budget"]
    },
    {
        "name": "Minimalist 2% Salicylic Acid Face Wash for Oily Acne Prone Skin",
        "brand": "Minimalist",
        "category": "beauty",
        "price_inr": 284,
        "mrp_inr": 299,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=minimalist+salicylic+acid+face+wash",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["cleanser", "face wash", "oily skin", "acne", "skincare"]
    },
    {
        "name": "L'Oreal Paris Glycolic Bright Glowing Night Cream",
        "brand": "L'Oreal Paris",
        "category": "beauty",
        "price_inr": 559,
        "mrp_inr": 799,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500",
        "product_url": "https://www.amazon.in/s?k=loreal+glycolic+bright+cream",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["night cream", "skincare", "brightening", "moisturizer"]
    },
    {
        "name": "Plum Green Tea Oil-Free Moisturizer for Oily Skin",
        "brand": "Plum",
        "category": "beauty",
        "price_inr": 399,
        "mrp_inr": 470,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=plum+green+tea+moisturizer",
        "in_stock": True,
        "rating": 4.5,
        "tags": ["moisturizer", "oily skin", "acne", "vegan", "skincare"]
    },
    {
        "name": "Dyson Airwrap Multi-Styler Complete Long Nickel Copper",
        "brand": "Dyson",
        "category": "beauty",
        "price_inr": 45900,
        "mrp_inr": 49900,
        "platform": "Nykaa",
        "image_url": "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500",
        "product_url": "https://www.nykaa.com/search/result/?q=dyson+airwrap",
        "in_stock": True,
        "rating": 4.9,
        "tags": ["hair", "styler", "luxury", "dyson", "gift"]
    },

    # ==================== APPAREL (10) ====================
    {
        "name": "Levi's Men 511 Slim Fit Mid-Rise Stretchable Jeans",
        "brand": "Levi's",
        "category": "apparel",
        "price_inr": 1799,
        "mrp_inr": 3599,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
        "product_url": "https://www.myntra.com/jeans",
        "in_stock": True,
        "rating": 4.5,
        "tags": ["jeans", "denim", "slim fit", "casual", "men"]
    },
    {
        "name": "Uniqlo U Crew Neck Oversized Short Sleeve T-Shirt",
        "brand": "Uniqlo",
        "category": "apparel",
        "price_inr": 1290,
        "mrp_inr": 1490,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
        "product_url": "https://www.myntra.com/tshirts",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["tshirt", "oversized", "cotton", "minimal", "streetwear"]
    },
    {
        "name": "Snitch Men Olive Green Cargo Parachute Pants",
        "brand": "Snitch",
        "category": "apparel",
        "price_inr": 1399,
        "mrp_inr": 2799,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500",
        "product_url": "https://www.myntra.com/trousers",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["cargos", "pants", "streetwear", "baggy", "under 1500"]
    },
    {
        "name": "Allen Solly Men Navy Blue Slim Fit Formal Blazer",
        "brand": "Allen Solly",
        "category": "apparel",
        "price_inr": 3999,
        "mrp_inr": 6999,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500",
        "product_url": "https://www.flipkart.com/search?q=allen+solly+navy+blazer",
        "in_stock": True,
        "rating": 4.5,
        "tags": ["blazer", "suit", "formal", "office", "wedding"]
    },
    {
        "name": "Fabindia Women Indigo Hand Block Print Cotton Kurta",
        "brand": "Fabindia",
        "category": "apparel",
        "price_inr": 1699,
        "mrp_inr": 2299,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
        "product_url": "https://www.myntra.com/kurtas",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["kurta", "ethnic", "cotton", "women", "under 2000"]
    },
    {
        "name": "The Souled Store Men Oversized Fleece Graphic Hoodie",
        "brand": "The Souled Store",
        "category": "apparel",
        "price_inr": 1499,
        "mrp_inr": 2499,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
        "product_url": "https://www.myntra.com/sweatshirts",
        "in_stock": True,
        "rating": 4.7,
        "tags": ["hoodie", "winter", "oversized", "under 2000", "fleece"]
    },
    {
        "name": "W for Woman Teal Embroidered Festive Straight Kurta Set",
        "brand": "W",
        "category": "apparel",
        "price_inr": 2499,
        "mrp_inr": 4999,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
        "product_url": "https://www.flipkart.com/search?q=w+for+woman+kurta+set",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["kurta", "festive", "ethnic", "women", "party"]
    },
    {
        "name": "Jack & Jones Men Black Faux Leather Biker Jacket",
        "brand": "Jack & Jones",
        "category": "apparel",
        "price_inr": 2999,
        "mrp_inr": 5999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
        "product_url": "https://www.myntra.com/jackets",
        "in_stock": True,
        "rating": 4.6,
        "tags": ["jacket", "biker", "winter", "leather", "men"]
    },
    {
        "name": "Marks & Spencer Women Pure Linen Relaxed Shirt",
        "brand": "Marks & Spencer",
        "category": "apparel",
        "price_inr": 1999,
        "mrp_inr": 2999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500",
        "product_url": "https://www.myntra.com/shirts",
        "in_stock": True,
        "rating": 4.5,
        "tags": ["shirt", "linen", "summer", "office", "women"]
    },
    {
        "name": "Bonkers Corner Heavyweight Black Pullover Hoodie",
        "brand": "Bonkers Corner",
        "category": "apparel",
        "price_inr": 1199,
        "mrp_inr": 1999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=500",
        "product_url": "https://www.myntra.com/sweatshirts",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["hoodie", "streetwear", "under 2000", "black", "winter"]
    },

    # ==================== ACCESSORIES (10) ====================
    {
        "name": "Casio Vintage A168WA-1WDF Metallic Digital Watch",
        "brand": "Casio",
        "category": "accessories",
        "price_inr": 2695,
        "mrp_inr": 2995,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500",
        "product_url": "https://www.amazon.in/s?k=casio+vintage+a168wa",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["watch", "retro", "casio", "digital", "unisex"]
    },
    {
        "name": "Ray-Ban Classic Aviator Green Polarized Sunglasses",
        "brand": "Ray-Ban",
        "category": "accessories",
        "price_inr": 7590,
        "mrp_inr": 9490,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
        "product_url": "https://www.myntra.com/sunglasses",
        "in_stock": True,
        "rating": 4.7,
        "tags": ["sunglasses", "aviator", "polarized", "uv protection"]
    },
    {
        "name": "Mokobara The Transit Backpack 15.6 Inch Laptop Bag",
        "brand": "Mokobara",
        "category": "accessories",
        "price_inr": 5499,
        "mrp_inr": 8999,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        "product_url": "https://www.amazon.in/s?k=mokobara+transit+backpack",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["backpack", "laptop bag", "travel", "office", "premium"]
    },
    {
        "name": "Titan Karishma Analog Black Dial Men Watch",
        "brand": "Titan",
        "category": "accessories",
        "price_inr": 1995,
        "mrp_inr": 2495,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
        "product_url": "https://www.flipkart.com/search?q=titan+karishma+watch",
        "in_stock": True,
        "rating": 4.5,
        "tags": ["watch", "analog", "formal", "gift", "under 2000"]
    },
    {
        "name": "Tommy Hilfiger Men Brown Genuine Leather RFID Wallet",
        "brand": "Tommy Hilfiger",
        "category": "accessories",
        "price_inr": 1349,
        "mrp_inr": 2599,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500",
        "product_url": "https://www.amazon.in/s?k=tommy+hilfiger+leather+wallet",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["wallet", "leather", "gift", "men", "under 1500"]
    },
    {
        "name": "Vincent Chase By Lenskart Black Full Rim Wayfarer Sunglasses",
        "brand": "Lenskart",
        "category": "accessories",
        "price_inr": 999,
        "mrp_inr": 1999,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
        "product_url": "https://www.flipkart.com/search?q=vincent+chase+wayfarer+sunglasses",
        "in_stock": True,
        "rating": 4.3,
        "tags": ["sunglasses", "wayfarer", "budget", "under 1000"]
    },
    {
        "name": "American Tourister Kamiliant Harrier 55cm Cabin Trolley Bag",
        "brand": "American Tourister",
        "category": "accessories",
        "price_inr": 2299,
        "mrp_inr": 6800,
        "platform": "Flipkart",
        "image_url": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500",
        "product_url": "https://www.flipkart.com/search?q=american+tourister+cabin+trolley",
        "in_stock": True,
        "rating": 4.4,
        "tags": ["luggage", "suitcase", "travel", "trolley", "cabin"]
    },
    {
        "name": "Lavie Women Beige Structured Handheld Tote Bag",
        "brand": "Lavie",
        "category": "accessories",
        "price_inr": 1499,
        "mrp_inr": 3999,
        "platform": "Myntra",
        "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
        "product_url": "https://www.myntra.com/handbags",
        "in_stock": True,
        "rating": 4.3,
        "tags": ["handbag", "tote", "women", "office", "under 1500"]
    },
    {
        "name": "Fossil Gen 6 Digital Black Dial Men Smartwatch",
        "brand": "Fossil",
        "category": "accessories",
        "price_inr": 14995,
        "mrp_inr": 24995,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500",
        "product_url": "https://www.amazon.in/s?k=fossil+gen+6+watch",
        "in_stock": False,
        "rating": 4.2,
        "tags": ["watch", "smartwatch", "luxury", "men"]
    },
    {
        "name": "Stanley Quencher H2.0 FlowState Stainless Steel Tumbler 1.18L",
        "brand": "Stanley",
        "category": "accessories",
        "price_inr": 4499,
        "mrp_inr": 5499,
        "platform": "Amazon India",
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
        "product_url": "https://www.amazon.in/s?k=stanley+quencher+tumbler",
        "in_stock": True,
        "rating": 4.8,
        "tags": ["bottle", "tumbler", "gym", "insulated", "viral"]
    }
]

def seed_bulk_inventory():
    print("Fetching existing inventory to prevent duplicates...")
    existing_res = supabase.table("products").select("name").execute()
    existing_names = {item["name"].strip().lower() for item in (existing_res.data or [])}

    to_insert = [
        prod for prod in NEW_PRODUCTS
        if prod["name"].strip().lower() not in existing_names
    ]

    if not to_insert:
        print("✅ All 50 products are already in your Supabase database!")
        return

    print(f"🚀 Inserting {len(to_insert)} new products into Supabase...")
    supabase.table("products").insert(to_insert).execute()
    print(f"🎉 Success! Added {len(to_insert)} new products. Total catalog size: {len(existing_names) + len(to_insert)} items!")

if __name__ == "__main__":
    seed_bulk_inventory()