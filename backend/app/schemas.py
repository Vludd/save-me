from pydantic import BaseModel, ConfigDict, Field

class BaseConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
class SInfoRequest(BaseConfig):
    url: str = Field(..., examples=["https://example.com"])
