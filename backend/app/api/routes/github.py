from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, create_access_token
from app.models.user import User
from app.models.github_repo import GithubRepo
from app.schemas.github import GithubLink
from datetime import timedelta

# Main router for GitHub API routes
router = APIRouter(prefix="/github", tags=["github"])


@router.post("/link")
async def link_github_account(
    data: GithubLink,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link GitHub account to user after OAuth callback"""
    try:
        # Verify the token works
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {data.access_token}"}
            )

            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid GitHub access token"
                )

            github_user = user_response.json()

        # Update user with GitHub info
        current_user.github_access_token = data.access_token
        current_user.github_username = data.github_username
        current_user.is_verified = True  # Mark as verified since they have GitHub
        db.commit()

        return {
            "message": "GitHub account linked successfully",
            "username": data.github_username
        }

    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying GitHub account"
        )


@router.post("/sync-repos")
async def sync_repos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync user's GitHub repositories"""
    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub not connected"
        )

    try:
        async with httpx.AsyncClient() as client:
            # Get user's repos with pagination
            repos_data = []
            page = 1
            per_page = 100

            while True:
                repos_response = await client.get(
                    "https://api.github.com/user/repos",
                    headers={
                        "Authorization": f"Bearer {current_user.github_access_token}",
                        "Accept": "application/vnd.github.v3+json"
                    },
                    params={"per_page": per_page, "page": page, "sort": "updated", "type": "all"}
                )

                if repos_response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to fetch repositories"
                    )

                page_data = repos_response.json()
                if not page_data:
                    break

                repos_data.extend(page_data)
                if len(page_data) < per_page:
                    break
                page += 1

            # Clear existing repos
            db.query(GithubRepo).filter(GithubRepo.user_id == current_user.id).delete()

            # Insert new repos with detailed analysis
            for repo in repos_data:
                # Get languages for each repo
                languages = {}
                if repo.get("languages_url"):
                    lang_response = await client.get(
                        repo["languages_url"],
                        headers={
                            "Authorization": f"Bearer {current_user.github_access_token}",
                            "Accept": "application/vnd.github.v3+json"
                        }
                    )
                    if lang_response.status_code == 200:
                        languages = lang_response.json()

                # Determine primary language
                primary_language = repo.get("language")
                if not primary_language and languages:
                    primary_language = max(languages.items(), key=lambda x: x[1])[0] if languages else None

                github_repo = GithubRepo(
                    user_id=current_user.id,
                    repo_id=str(repo["id"]),
                    name=repo["name"],
                    full_name=repo["full_name"],
                    description=repo.get("description"),
                    url=repo["html_url"],
                    language=primary_language,
                    languages=languages,
                    topics=repo.get("topics", []),
                    stars=repo.get("stargazers_count", 0),
                    forks=repo.get("forks_count", 0),
                    is_private=repo.get("private", False),
                    is_selected=True  # Default to selected
                )
                db.add(github_repo)

            db.commit()

        return {
            "message": "Repositories synced successfully",
            "count": len(repos_data)
        }

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing repositories: {str(e)}"
        )


@router.get("/repos")
async def get_repos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's GitHub repositories"""
    repos = db.query(GithubRepo).filter(
        GithubRepo.user_id == current_user.id
    ).order_by(GithubRepo.stars.desc(), GithubRepo.updated_at.desc()).all()
    return repos


@router.put("/repos/{repo_id}/toggle")
async def toggle_repo(
    repo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle repo selection for CV"""
    repo = db.query(GithubRepo).filter(
        GithubRepo.id == repo_id,
        GithubRepo.user_id == current_user.id
    ).first()

    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )

    repo.is_selected = not repo.is_selected
    db.commit()

    return {
        "id": repo.id,
        "is_selected": repo.is_selected,
        "name": repo.name
    }


@router.delete("/disconnect")
async def disconnect_github(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect GitHub account"""
    current_user.github_access_token = None
    current_user.github_username = None

    # Delete all repos
    db.query(GithubRepo).filter(GithubRepo.user_id == current_user.id).delete()

    db.commit()

    return {"message": "GitHub disconnected successfully"}


@router.get("/status")
async def get_github_status(current_user: User = Depends(get_current_user)):
    """Get GitHub connection status"""
    return {
        "connected": current_user.github_access_token is not None,
        "username": current_user.github_username
    }


@router.post("/repos/{repo_id}/analyze")
async def analyze_repo_for_job(
    repo_id: int,
    job_requirements: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze a GitHub repository against job requirements.
    Returns a relevance score and explanation.
    """
    repo = db.query(GithubRepo).filter(
        GithubRepo.id == repo_id,
        GithubRepo.user_id == current_user.id
    ).first()

    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )

    required_skills = job_requirements.get("skills", [])
    required_keywords = job_requirements.get("keywords", [])

    # Calculate relevance score
    score = 0
    matches = []

    # Check primary language match
    if repo.language:
        lang_lower = repo.language.lower()
        for skill in required_skills:
            if lang_lower in skill.lower() or skill.lower() in lang_lower:
                score += 30
                matches.append({
                    "type": "language",
                    "matched": repo.language,
                    "required": skill
                })
                break

    # Check all languages
    if repo.languages:
        for lang in repo.languages.keys():
            for skill in required_skills:
                if lang.lower() in skill.lower() or skill.lower() in lang.lower():
                    if not any(m["matched"] == lang for m in matches):
                        score += 15
                        matches.append({
                            "type": "language",
                            "matched": lang,
                            "required": skill
                        })

    # Check topics
    if repo.topics:
        for topic in repo.topics:
            for skill in required_skills + required_keywords:
                if topic.lower() in skill.lower() or skill.lower() in topic.lower():
                    if not any(m["matched"] == topic for m in matches):
                        score += 10
                        matches.append({
                            "type": "topic",
                            "matched": topic,
                            "required": skill
                        })

    # Check description
    if repo.description:
        desc_lower = repo.description.lower()
        for keyword in required_keywords:
            if keyword.lower() in desc_lower:
                if not any(m["matched"] == keyword for m in matches):
                    score += 5
                    matches.append({
                        "type": "description",
                        "matched": keyword,
                        "context": repo.description
                    })

    # Cap score at 100
    score = min(score, 100)

    return {
        "repo_id": repo.id,
        "repo_name": repo.name,
        "relevance_score": score,
        "matches": matches,
        "recommendation": _get_recommendation(score)
    }


def _get_recommendation(score: int) -> str:
    """Get recommendation based on relevance score"""
    if score >= 70:
        return "highly_recommended"
    elif score >= 40:
        return "recommended"
    elif score >= 20:
        return "maybe_relevant"
    else:
        return "not_relevant"
