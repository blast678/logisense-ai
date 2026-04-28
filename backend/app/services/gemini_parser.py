import os
import json
from google import genai
from google.genai import types
from app.schemas.disruptions import DisruptionAnalysis
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_unstructured_alert(text_alert: str) -> dict:
    """Uses Gemini 2.5 Flash to rapidly extract structured data from unstructured text."""

    
    # 👇 FIX 1: Convert Python dict to proper JSON string for the prompt
    schema_str = json.dumps(DisruptionAnalysis.model_json_schema())
    
    prompt = f"""
    You are a multilingual supply chain risk analyst operating in Maharashtra, India.
    Analyze the following unstructured local news alert, which may be written in English, Marathi, or Hindi.
    Extract the supply chain disruption details.
    
    CRITICAL RULES:
    1. Translate and understand the context internally, but ALWAYS output the final JSON values in English.
    2. Ensure the 'location' field is ONLY a simple, highly-searchable City or Town name (e.g., "Khandala", "Panvel", "Khopoli"). DO NOT include highway names, "Ghat", or long descriptions.
    
    Alert Text: "{text_alert}"
    
    Respond strictly in valid JSON format without markdown blocks, matching this schema exactly:
    {schema_str}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        # 👇 FIX 2: Bulletproof JSON parsing (strips hidden markdown tags)
        clean_text = response.text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:-3].strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:-3].strip()
            
        result = json.loads(clean_text)
        validated_data = DisruptionAnalysis(**result)
        return validated_data.model_dump()
        
    except Exception as e:
        # 👇 FIX 3: Print the exact error to the terminal so we can see what broke
        print(f"❌ GEMINI CRASHED: {e}")
        return {"error": str(e), "is_disruption": False}