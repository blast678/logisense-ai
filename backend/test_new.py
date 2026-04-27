import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load your secrets
load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

async def test_news_connection():
    print("📡 Pinging NewsAPI servers...")
    
    if not NEWS_API_KEY:
        print("❌ ERROR: NEWS_API_KEY is missing from your .env file!")
        return

    # We use your current location context to fetch live local data
    search_query = "Mumbai OR Maharashtra"
    url = f"https://newsapi.org/v2/everything?q={search_query}&sortBy=publishedAt&language=en&apiKey={NEWS_API_KEY}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            
            print(f"HTTP Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                total_results = data.get('totalResults', 0)
                print(f"✅ SUCCESS: Connected to NewsAPI! Found {total_results} live articles.")
                
                # Print the single freshest article right now
                articles = data.get('articles', [])
                if articles:
                    print("\n📰 Freshest Article Right Now:")
                    print(f"Title: {articles[0]['title']}")
                    print(f"Published: {articles[0]['publishedAt']}")
            
            # Common NewsAPI Error Codes
            elif response.status_code == 401:
                print("❌ ERROR 401: Your API Key is invalid. Check your .env file.")
            elif response.status_code == 429:
                print("❌ ERROR 429: Rate Limit Hit! You made too many requests today.")
            else:
                print(f"⚠️ API FAILED: {response.text}")
                
    except Exception as e:
        print(f"💥 CRASH: Could not connect to the internet. Details: {e}")

if __name__ == "__main__":
    # This forces Python to run the async function
    asyncio.run(test_news_connection())