from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
from docxtpl import DocxTemplate
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.adaptation import Adaptation
from app.schemas.resume import OptimizationRequest, OptimizationResponse, AdaptationListResponse

router = APIRouter()

@router.post("/", response_model=OptimizationResponse)
async def optimize_resume(
    request: OptimizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Optimize resume for a specific job offer using AI"""
    
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == request.resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # TODO: Call AI API to optimize resume
    # For now, return mock data
    optimized_content = {
        "name": "John Doe",
        "title": request.job_title,
        "summary": "Experienced professional with expertise in...",
        "experience": [
            {
                "title": "Senior Developer",
                "company": "Tech Corp",
                "date": "2020 - Present",
                "achievements": [
                    "Achieved X by doing Y, measured by Z"
                ]
            }
        ],
        "skills": ["Python", "FastAPI", "React"],
        "education": []
    }
    
    keywords_added = ["Python", "FastAPI", "React", "Agile"]
    match_score = 85
    
    # Create adaptation record
    adaptation = Adaptation(
        user_id=current_user.id,
        resume_id=resume.id,
        job_title=request.job_title,
        job_url=request.job_url,
        job_description=request.job_description,
        optimized_content=optimized_content,
        match_score=match_score,
        keywords_added=keywords_added
    )
    
    # TODO: Generate adapted DOCX using docxtpl
    # adaptation.adapted_file_path = generate_docx(optimized_content, resume.file_path)
    
    # TODO: Generate PDF
    # adaptation.pdf_file_path = generate_pdf(adaptation.adapted_file_path)
    
    db.add(adaptation)
    db.commit()
    db.refresh(adaptation)
    
    return adaptation

@router.get("/history", response_model=list[AdaptationListResponse])
async def get_adaptations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's adaptation history"""
    adaptations = db.query(Adaptation).filter(
        Adaptation.user_id == current_user.id
    ).order_by(Adaptation.created_at.desc()).all()
    
    return adaptations

@router.get("/{adaptation_id}", response_model=OptimizationResponse)
async def get_adaptation(
    adaptation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific adaptation details"""
    adaptation = db.query(Adaptation).filter(
        Adaptation.id == adaptation_id,
        Adaptation.user_id == current_user.id
    ).first()
    
    if not adaptation:
        raise HTTPException(status_code=404, detail="Adaptation not found")
    
    return adaptation
