import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load your API key from the .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("🔍 Scanning for available Gemini models...\n")

try:
    # Loop through all models available to your account
    for m in genai.list_models():
        # We only care about models that can generate text/JSON
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ Found Model Name: {m.name}")
except Exception as e:
    print(f"❌ Error fetching models: {e}")