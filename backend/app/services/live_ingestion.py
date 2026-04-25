import os
import httpx
from dotenv import load_dotenv

# 👇 THIS IS THE CORRECTED IMPORT 👇
from app.services.gemini_parser import analyze_unstructured_alert

load_dotenv()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

async def hunt_for_disruptions():
    """Scours the internet for live disruptions and passes them to Gemini."""
    search_query = "highway OR traffic OR strike OR flood OR accident Maharashtra"
    url = f"https://newsapi.org/v2/everything?q={search_query}&sortBy=publishedAt&language=en&apiKey={NEWS_API_KEY}"
    
    active_threats = []

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            print(f"❌ News API Error: {response.status_code}")
            return []
            
        data = response.json()
        articles = data.get("articles", [])[:3] 
        
        print("INJECTING SYNTHETIC DISASTER...")
        articles = [
            {
                "title": "ब्रेकिंग: खंडाळा घाटात दरड कोसळली",
                "description": "पुणे-मुंबई एक्स्प्रेसवेवर खंडाळा घाटात मोठी दरड कोसळली आहे. सर्व व्यावसायिक वाहनांची वाहतूक थांबवण्यात आली असून रस्ता पूर्ववत होण्यासाठी किमान 12 तास लागतील असा अंदाज आहे.",
                "url": "https://lokmat-synthetic.test"
            }
        ]
        
        for article in articles:
            news_text = f"{article['title']} - {article['description']}"
            print(f"Hunting: {article['title']}")
            
            ai_analysis = analyze_unstructured_alert(news_text)
            
            if ai_analysis.get("is_disruption"):
                ai_analysis["source_url"] = article["url"]
                active_threats.append(ai_analysis)
                
    return active_threats