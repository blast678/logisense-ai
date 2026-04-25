from pydantic import BaseModel, Field

class DisruptionAnalysis(BaseModel):
    is_disruption: bool = Field(description="True if the text indicates a supply chain delay, strike, or blockage.")
    severity: str = Field(description="Classify as LOW, MEDIUM, or HIGH.")
    location: str = Field(description="The specific city, highway, or port mentioned (e.g., 'NH-48', 'Mumbai').")
    estimated_delay_hours: int = Field(description="Estimated delay in hours. If unknown, estimate based on severity.")
    reason: str = Field(description="A brief 5-word summary of the cause.")