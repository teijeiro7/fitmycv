from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Adaptation(Base):
    __tablename__ = "adaptations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)

    # Job information
    job_title = Column(String, nullable=False)
    job_company = Column(String, nullable=True)
    job_location = Column(String, nullable=True)
    job_url = Column(String, nullable=True)
    job_description = Column(Text, nullable=False)
    job_requirements = Column(JSON, nullable=True)  # Extracted and structured requirements

    # AI-generated content
    optimized_content = Column(JSON, nullable=True)  # Structured CV data by section
    match_score = Column(Integer, nullable=True)  # 0-100
    keywords_added = Column(JSON, nullable=True)  # List of keywords emphasized
    keywords_missing = Column(JSON, nullable=True)  # List of required keywords not found
    changes_made = Column(JSON, nullable=True)  # List of changes made
    recommendations = Column(JSON, nullable=True)  # List of additional recommendations

    # Language selection
    language = Column(String, nullable=True)  # Language used for the CV (e.g., "English", "Spanish")
    language_reason = Column(String, nullable=True)  # Explanation of why this language was chosen

    # GitHub projects included
    github_projects_included = Column(JSON, nullable=True)  # List of included projects
    selected_github_projects = Column(JSON, nullable=True)  # Projects selected with reasons

    # Output files
    adapted_file_path = Column(String, nullable=True)
    pdf_file_path = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="adaptations")
    resume = relationship("Resume", back_populates="adaptations")
