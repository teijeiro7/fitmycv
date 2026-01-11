from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeUpload(BaseModel):
    title: str

class ResumeResponse(BaseModel):
    id: int
    title: str
    original_filename: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobDescriptionInput(BaseModel):
    url: Optional[str] = None
    description: Optional[str] = None

class JobDescriptionResponse(BaseModel):
    title: str
    description: str
    keywords: List[str]
    skills: List[str]

class OptimizationRequest(BaseModel):
    resume_id: int
    job_title: str
    job_description: str
    job_url: Optional[str] = None

class OptimizationResponse(BaseModel):
    id: int
    job_title: str
    match_score: int
    keywords_added: List[str]
    optimized_content: Dict[str, Any]
    adapted_file_path: str
    pdf_file_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class AdaptationListResponse(BaseModel):
    id: int
    job_title: str
    match_score: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True
