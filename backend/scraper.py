from playwright.async_api import async_playwright
import asyncio
import os
import urllib.parse
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables for Supabase
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def sync_exact_links():
    print("Starting Playwright Database Sync...")
    response = supabase.table("products").select("id, name, platform, product_url").execute()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        for product in response.data:
            if len(product['product_url']) < 55 or "search" in product['product_url']:
                print(f"Syncing exact link for: {product['name']}...")
                href = None
                try:
                    # Safely encode special characters like '&' and '.'
                    safe_query = urllib.parse.quote_plus(product['name'])
                    
                    if product['platform'].lower() == "myntra":
                        url = f"https://www.myntra.com/search?q={safe_query}"
                        await page.goto(url, timeout=20000)
                        await page.wait_for_selector('li.product-base a', timeout=15000)
                        href = await page.eval_on_selector('li.product-base a', 'el => el.href')
                        
                    elif product['platform'].lower() == "flipkart":
                        url = f"https://www.flipkart.com/search?q={safe_query}"
                        await page.goto(url, timeout=20000)
                        await page.wait_for_selector('a[target="_blank"]', timeout=15000)
                        href = await page.eval_on_selector('a[target="_blank"]', 'el => el.href')
                    
                    if href:
                        supabase.table("products").update({"product_url": href}).eq("id", product['id']).execute()
                        print(f"✅ Saved direct link: {href}")
                        
                except Exception as e:
                    print(f"❌ Failed to find exact link for {product['name']}")
                
                await asyncio.sleep(2)
        
        await browser.close()
    print("Sync Complete! All products now have exact BuyHatke-style links.")

if __name__ == "__main__":
    asyncio.run(sync_exact_links())