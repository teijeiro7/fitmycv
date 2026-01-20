from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Optional
import uuid

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.resume import Resume
from app.models.adaptation import Adaptation
from app.models.github_repo import GithubRepo
from app.schemas.resume import (
    OptimizationRequest,
    OptimizationResponse,
    AdaptationListResponse,
    AdaptationUpdate
)
from app.services.ai_adapter import AIAdapter, get_ai_adapter

router = APIRouter()


@router.post("/adapt", response_model=OptimizationResponse)
async def adapt_resume(
    request: OptimizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adapt a resume for a specific job offer using AI.

    The AI will:
    1. Analyze the job requirements
    2. Match the candidate's experience to requirements
    3. Optimize the resume content for the position
    4. Calculate a match score
    5. Include relevant GitHub projects if requested
    """
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == request.resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Get GitHub repos if requested
    github_projects = None
    if request.include_github_repos:
        repos_query = db.query(GithubRepo).filter(
            GithubRepo.user_id == current_user.id,
            GithubRepo.is_selected == True
        )

        if request.github_repo_ids:
            repos_query = repos_query.filter(GithubRepo.id.in_(request.github_repo_ids))

        repos = repos_query.all()
        github_projects = [
            {
                "name": r.name,
                "full_name": r.full_name,
                "description": r.description,
                "url": r.url,
                "language": r.language,
                "languages": r.languages,
                "topics": r.topics,
                "stars": r.stars
            }
            for r in repos
        ]

    # First, extract job details if not provided
    ai = get_ai_adapter()
    job_details = await ai.extract_job_details(
        request.job_description,
        request.job_url
    )

    # If including GitHub repos, analyze them for relevance
    if github_projects and job_details.get("required_skills"):
        github_projects = await ai.analyze_github_repos_for_job(
            github_projects,
            job_details
        )
        # Only include highly relevant projects
        github_projects = [p for p in github_projects if p.get("should_include", False)]

    # Adapt the resume
    try:
        result = await ai.adapt_resume(
            resume_text=resume.extracted_text or "",
            parsed_sections=resume.parsed_sections or {},
            job_description=request.job_description,
            job_title=request.job_title,
            job_company=request.job_company or job_details.get("company"),
            job_location=request.job_location or job_details.get("location"),
            target_keywords=request.target_keywords or job_details.get("required_skills", []),
            github_projects=github_projects,
            tone=request.tone
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error adapting resume with AI: {str(e)}"
        )

    # Create adapted file path
    adapted_dir = Path(settings.UPLOAD_DIR) / f"user_{current_user.id}" / "adapted"
    adapted_dir.mkdir(parents=True, exist_ok=True)
    adapted_filename = f"adapted_{uuid.uuid4().hex[:8]}_{request.job_title.replace(' ', '_').lower()}"
    adapted_docx_path = adapted_dir / f"{adapted_filename}.docx"
    adapted_pdf_path = adapted_dir / f"{adapted_filename}.pdf"

    # Create adaptation record
    adaptation = Adaptation(
        user_id=current_user.id,
        resume_id=resume.id,
        job_title=request.job_title,
        job_company=request.job_company or job_details.get("company"),
        job_location=request.job_location or job_details.get("location"),
        job_url=request.job_url,
        job_description=request.job_description,
        job_requirements=job_details,
        optimized_content=result.get("optimized_content", {}),
        match_score=result.get("match_score", 0),
        keywords_added=result.get("keywords_added", []),
        keywords_missing=result.get("keywords_missing", []),
        changes_made=result.get("changes_made", []),
        recommendations=result.get("recommendations", []),
        language=result.get("language"),
        language_reason=result.get("language_reason"),
        selected_github_projects=result.get("selected_github_projects", []),
        github_projects_included=github_projects or [],
        adapted_file_path=str(adapted_docx_path),
        pdf_file_path=str(adapted_pdf_path)
    )

    db.add(adaptation)
    db.commit()
    db.refresh(adaptation)

    return adaptation


@router.get("/history", response_model=list[AdaptationListResponse])
async def get_adaptations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100)
):
    """Get user's adaptation history"""
    adaptations = db.query(Adaptation).filter(
        Adaptation.user_id == current_user.id
    ).order_by(Adaptation.created_at.desc()).limit(limit).all()

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


@router.put("/{adaptation_id}")
async def update_adaptation(
    adaptation_id: int,
    update_data: AdaptationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an adaptation (for manual editing)"""
    adaptation = db.query(Adaptation).filter(
        Adaptation.id == adaptation_id,
        Adaptation.user_id == current_user.id
    ).first()

    if not adaptation:
        raise HTTPException(status_code=404, detail="Adaptation not found")

    adaptation.optimized_content = update_data.optimized_content
    db.commit()

    return {"message": "Adaptation updated successfully"}


@router.delete("/{adaptation_id}")
async def delete_adaptation(
    adaptation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an adaptation"""
    adaptation = db.query(Adaptation).filter(
        Adaptation.id == adaptation_id,
        Adaptation.user_id == current_user.id
    ).first()

    if not adaptation:
        raise HTTPException(status_code=404, detail="Adaptation not found")

    # Delete files
    Path(adaptation.adapted_file_path).unlink(missing_ok=True)
    Path(adaptation.pdf_file_path).unlink(missing_ok=True)

    db.delete(adaptation)
    db.commit()

    return {"message": "Adaptation deleted successfully"}


@router.post("/{adaptation_id}/generate-documents")
async def generate_adapted_documents(
    adaptation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate DOCX and PDF files from the adapted content"""
    adaptation = db.query(Adaptation).filter(
        Adaptation.id == adaptation_id,
        Adaptation.user_id == current_user.id
    ).first()

    if not adaptation:
        raise HTTPException(status_code=404, detail="Adaptation not found")

    # Import document generator to avoid circular imports
    from app.services.document_generator import DocumentGenerator

    generator = DocumentGenerator()

    # Generate DOCX
    try:
        docx_path = generator.generate_docx(
            optimized_content=adaptation.optimized_content,
            output_path=adaptation.adapted_file_path
        )
        adaptation.adapted_file_path = str(docx_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating DOCX: {str(e)}"
        )

    # Generate PDF
    try:
        pdf_path = generator.generate_pdf(
            docx_path=Path(adaptation.adapted_file_path),
            output_path=adaptation.pdf_file_path
        )
        adaptation.pdf_file_path = str(pdf_path)
    except Exception as e:
        # PDF generation is non-critical, log but don't fail
        pass

    db.commit()

    return {
        "message": "Documents generated successfully",
        "docx_path": adaptation.adapted_file_path,
        "pdf_path": adaptation.pdf_file_path
    }
