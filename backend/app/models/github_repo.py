from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class GithubRepo(Base):
    __tablename__ = "github_repos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    repo_id = Column(String, nullable=False)  # GitHub repo ID
    name = Column(String, nullable=False)
    full_name = Column(String, nullable=False)  # owner/repo
    description = Column(Text, nullable=True)
    url = Column(String, nullable=False)
    language = Column(String, nullable=True)  # Primary language
    languages = Column(JSON, nullable=True)  # All languages with bytes/percentages
    topics = Column(JSON, nullable=True)  # Repository topics/tags
    stars = Column(Integer, default=0)
    forks = Column(Integer, default=0)
    is_private = Column(Boolean, default=False)
    is_selected = Column(Boolean, default=True)  # User wants to include in CV
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="github_repos")
