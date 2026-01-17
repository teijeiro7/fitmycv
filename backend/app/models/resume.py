from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    # Extracted content
    extracted_text = Column(Text, nullable=True)
    parsed_sections = Column(JSON, nullable=True)  # Structured sections (summary, experience, etc.)

    # Metadata
    word_count = Column(Integer, default=0)
    page_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="resumes")
    adaptations = relationship("Adaptation", back_populates="resume", cascade="all, delete-orphan")
