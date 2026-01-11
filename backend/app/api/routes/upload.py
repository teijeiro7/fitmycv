from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from docx import Document
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse

router = APIRouter()

@router.post("/", response_model=ResumeResponse)
async def upload_resume(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a resume file (.docx)"""
    
    # Validate file extension
    if not file.filename.endswith('.docx'):
        raise HTTPException(
            status_code=400,
            detail="Only .docx files are supported"
        )
    
    # Create upload directory
    upload_dir = Path(settings.UPLOAD_DIR) / f"user_{current_user.id}"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / f"{file.filename}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text from docx
    try:
        doc = Document(file_path)
        extracted_text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error extracting text from document: {str(e)}"
        )
    
    # Save to database
    db_resume = Resume(
        user_id=current_user.id,
        title=title,
        original_filename=file.filename,
        file_path=str(file_path),
        extracted_text=extracted_text
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
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes
