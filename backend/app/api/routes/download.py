from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.adaptation import Adaptation
from app.models.resume import Resume

router = APIRouter(prefix="/download", tags=["Download"])


@router.get("/adaptation/{adaptation_id}/docx")
async def download_adaptation_docx(
    adaptation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the adapted DOCX file"""
    adaptation = db.query(Adaptation).filter(
        Adaptation.id == adaptation_id,
        Adaptation.user_id == current_user.id
    ).first()

    if not adaptation:
        raise HTTPException(status_code=404, detail="Adaptation not found")

    file_path = Path(adaptation.adapted_file_path)

    if not file_path.exists():
        # Generate the file if it doesn't exist
        from app.services.document_generator import DocumentGenerator
        generator = DocumentGenerator()
        try:
            generated_path = generator.generate_docx(
                optimized_content=adaptation.optimized_content,
                output_path=file_path
            )
            file_path = Path(generated_path)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating document: {str(e)}"
            )

    # Create filename
    safe_title = "".join(c for c in adaptation.job_title if c.isalnum() or c in (' ', '-', '_')).strip()
    filename = f"CV_{safe_title}_{current_user.full_name or 'Candidate'}.docx"

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@router.get("/adaptation/{adaptation_id}/pdf")
async def download_adaptation_pdf(
    adaptation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the adapted PDF file"""
    adaptation = db.query(Adaptation).filter(
        Adaptation.id == adaptation_id,
        Adaptation.user_id == current_user.id
    ).first()

    if not adaptation:
        raise HTTPException(status_code=404, detail="Adaptation not found")

    file_path = Path(adaptation.pdf_file_path)

    if not file_path.exists():
        # Try to generate PDF
        from app.services.document_generator import DocumentGenerator
        generator = DocumentGenerator()

        docx_path = Path(adaptation.adapted_file_path)
        if docx_path.exists():
            generated_path = generator.generate_pdf(
                docx_path=docx_path,
                output_path=file_path
            )
            if generated_path:
                file_path = Path(generated_path)
            else:
                raise HTTPException(
                    status_code=500,
                    detail="PDF generation is not available on this server. Please download the DOCX version."
                )
        else:
            raise HTTPException(
                status_code=404,
                detail="Source document not found. Please generate the documents first."
            )

    # Create filename
    safe_title = "".join(c for c in adaptation.job_title if c.isalnum() or c in (' ', '-', '_')).strip()
    filename = f"CV_{safe_title}_{current_user.full_name or 'Candidate'}.pdf"

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/pdf"
    )


@router.get("/resume/{resume_id}")
async def download_original_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the original uploaded resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    file_path = Path(resume.file_path)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=str(file_path),
        filename=resume.original_filename,
        media_type="application/octet-stream"
    )
