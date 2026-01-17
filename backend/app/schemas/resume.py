from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResumeUpload(BaseModel):
    title: str


class ResumeResponse(BaseModel):
    id: int
    title: str
    original_filename: str
    word_count: int
    page_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeDetailResponse(ResumeResponse):
    extracted_text: Optional[str] = None
    parsed_sections: Optional[Dict[str, str]] = None
    file_path: str

    class Config:
        from_attributes = True


class JobDescriptionInput(BaseModel):
    url: Optional[str] = None
    description: Optional[str] = None


class JobDescriptionResponse(BaseModel):
    title: str
    description: str
    company: Optional[str] = None
    location: Optional[str] = None
    keywords: List[str]
    skills: List[str]
    requirements: List[str]
    nice_to_have: List[str]


class OptimizationRequest(BaseModel):
    resume_id: int
    job_title: str
    job_description: str
    job_url: Optional[str] = None
    job_company: Optional[str] = None
    job_location: Optional[str] = None
    target_keywords: Optional[List[str]] = None
    include_github_repos: bool = False
    github_repo_ids: Optional[List[int]] = None
    tone: Optional[str] = "professional"  # professional, casual, confident


class GitHubProjectReference(BaseModel):
    name: str
    description: str
    url: str
    technologies: List[str]
    relevance_score: int


class OptimizedSection(BaseModel):
    name: str
    original: str
    optimized: str
    changes_made: List[str]


class OptimizationResponse(BaseModel):
    id: int
    job_title: str
    job_company: Optional[str] = None
    match_score: int
    keywords_added: List[str]
    keywords_missing: List[str]
    optimized_content: Dict[str, Any]
    github_projects_included: Optional[List[GitHubProjectReference]] = None
    adapted_file_path: Optional[str] = None
    pdf_file_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdaptationListResponse(BaseModel):
    id: int
    job_title: str
    job_company: Optional[str] = None
    match_score: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class AdaptationUpdate(BaseModel):
    optimized_content: Dict[str, Any]
