from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse, ResumeDetailResponse
from app.services.document_processor import DocumentProcessor, parse_resume_structure

router = APIRouter()


@router.post("/", response_model=ResumeDetailResponse)
async def upload_resume(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a resume file (.docx or .pdf)"""

    # Validate file extension
    is_valid, file_extension = DocumentProcessor.validate_file_extension(
        file.filename,
        settings.ALLOWED_EXTENSIONS
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Create upload directory
    upload_dir = Path(settings.UPLOAD_DIR) / f"user_{current_user.id}"
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename to avoid conflicts
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename

    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving file: {str(e)}"
        )

    # Extract text and metadata from document
    try:
        extracted_text = DocumentProcessor.extract_text(file_path)
        metadata = DocumentProcessor.get_document_metadata(file_path)
        parsed_sections = parse_resume_structure(extracted_text)
    except ValueError as e:
        # Delete the file if processing failed
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=422,
            detail=str(e)
        )
    except Exception as e:
        # Delete the file if processing failed
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )

    # Validate that we actually got some content
    if not extracted_text or len(extracted_text.strip()) < 50:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=422,
            detail="Could not extract sufficient text from document. Please ensure the document contains readable text."
        )

    # Save to database
    db_resume = Resume(
        user_id=current_user.id,
        title=title,
        original_filename=file.filename,
        file_path=str(file_path),
        extracted_text=extracted_text,
        parsed_sections=parsed_sections,
        word_count=metadata.get("word_count", 0),
        page_count=metadata.get("page_count", 0)
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return db_resume


@router.get("/", response_model=list[ResumeResponse])
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all resumes for the current user"""
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.created_at.desc()).all()
    return resumes


@router.get("/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific resume by ID"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    return resume


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    # Delete the file from filesystem
    try:
        Path(resume.file_path).unlink(missing_ok=True)
    except Exception:
        pass  # File might not exist, that's ok

    # Delete from database
    db.delete(resume)
    db.commit()

    return {"message": "Resume deleted successfully"}


@router.post("/{resume_id}/parse")
async def reparse_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Re-parse an existing resume to extract structured data"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    try:
        file_path = Path(resume.file_path)
        extracted_text = DocumentProcessor.extract_text(file_path)
        metadata = DocumentProcessor.get_document_metadata(file_path)
        parsed_sections = parse_resume_structure(extracted_text)

        # Update resume with new parsed data
        resume.extracted_text = extracted_text
        resume.parsed_sections = parsed_sections
        resume.word_count = metadata.get("word_count", 0)
        resume.page_count = metadata.get("page_count", 0)

        db.commit()
        db.refresh(resume)

        return {
            "message": "Resume re-parsed successfully",
            "sections": parsed_sections
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error re-parsing document: {str(e)}"
        )
