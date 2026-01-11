from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.github_repo import GithubRepo

router = APIRouter(prefix="/github", tags=["github"])


@router.get("/connect")
async def connect_github():
    """Initiate GitHub OAuth flow"""
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub OAuth not configured"
        )
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.GITHUB_CLIENT_ID}&"
        f"redirect_uri={settings.GITHUB_REDIRECT_URI}&"
        f"scope=read:user,repo"
    )
    
    return {"auth_url": github_auth_url}


@router.get("/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """Handle GitHub OAuth callback"""
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub OAuth not configured"
        )
    
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange code for token"
            )
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received"
            )
        
        # Get user info from GitHub
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from GitHub"
            )
        
        github_user = user_response.json()
    
    # Redirect to frontend with token (in production, use secure method)
    redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?token={access_token}&username={github_user['login']}"
    return RedirectResponse(url=redirect_url)


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
    
    async with httpx.AsyncClient() as client:
        # Get user's repos
        repos_response = await client.get(
            "https://api.github.com/user/repos",
            headers={"Authorization": f"Bearer {current_user.github_access_token}"},
            params={"per_page": 100, "sort": "updated"}
        )
        
        if repos_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch repositories"
            )
        
        repos_data = repos_response.json()
        
        # Clear existing repos
        db.query(GithubRepo).filter(GithubRepo.user_id == current_user.id).delete()
        
        # Insert new repos
        for repo in repos_data:
            # Get languages for each repo
            languages = {}
            if repo.get("languages_url"):
                lang_response = await client.get(
                    repo["languages_url"],
                    headers={"Authorization": f"Bearer {current_user.github_access_token}"}
                )
                if lang_response.status_code == 200:
                    languages = lang_response.json()
            
            github_repo = GithubRepo(
                user_id=current_user.id,
                repo_id=str(repo["id"]),
                name=repo["name"],
                full_name=repo["full_name"],
                description=repo.get("description"),
                url=repo["html_url"],
                language=repo.get("language"),
                languages=languages,
                topics=repo.get("topics", []),
                stars=repo.get("stargazers_count", 0)
            )
            db.add(github_repo)
        
        db.commit()
    
    return {"message": "Repositories synced successfully", "count": len(repos_data)}


@router.get("/repos")
async def get_repos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's GitHub repositories"""
    repos = db.query(GithubRepo).filter(GithubRepo.user_id == current_user.id).all()
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
    
    return {"is_selected": repo.is_selected}


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
