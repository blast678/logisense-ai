# app/services/notifier.py

def format_whatsapp_alert(driver_name, threat_type, location, action_required):
    """
    Generates a WhatsApp-formatted markdown message for the driver.
    """
    msg = f"🚛 *LogiSense AI Fleet Alert: {driver_name}*\n"
    msg += "-----------------------------------\n"
    msg += f"🚨 *URGENT ACTION:* {action_required}\n\n"
    msg += f"📍 *Reported Location:* {location}\n"
    msg += f"📰 *Live News Report:* {threat_type}\n\n"
    msg += "👉 *DRIVER ACTION REQUIRED:*\n"
    msg += "Please review the alert above. Reply *BLOCKED* if your route is affected, or *CLEAR* if you can proceed safely."
    
    return msg


def generate_whatsapp_payload(truck_id, action, risk_score, threat_location, threat_reason, source_url):
    """
    Generates a WhatsApp-formatted markdown message for the driver.
    """
    
    # 1. The Alert Header
    msg = f"🚛 *LogiSense AI Fleet Alert: {truck_id}*\n"
    msg += "-----------------------------------\n"
    
    # 2. The Math Engine Command
    if risk_score > 80:
        msg += f"🚨 *URGENT ACTION:* {action}\n\n"
    elif risk_score > 50:
        msg += f"⚠️ *WARNING:* {action}\n\n"
    else:
        msg += f"ℹ️ *UPDATE:* {action}\n\n"
        
    # 3. The AI Context (So the driver knows WHY)
    msg += f"📍 *Reported Location:* {threat_location}\n"
    msg += f"📰 *Live News Report:* {threat_reason}\n"
    if source_url:
        msg += f"🔗 *Read Full Local Alert:* {source_url}\n\n"
        
    # 4. The Human-in-the-Loop Validation Request
    msg += "👉 *DRIVER ACTION REQUIRED:*\n"
    msg += "Please review the news above. Reply *BLOCKED* if your route is affected, or *CLEAR* if you can proceed safely."
    
    return msg