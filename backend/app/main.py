from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.routes import auth, upload, scrape, optimize, users, github, download

app = FastAPI(
    title="FitMyCV API",
    description="AI-powered Resume Adaptation Platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(auth.callback_router, tags=["OAuth Callbacks"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(scrape.router, prefix="/api/scrape", tags=["Scraping"])
app.include_router(optimize.router, prefix="/api/optimize", tags=["Optimization"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(github.router, prefix="/api", tags=["GitHub"])
app.include_router(download.router, prefix="/api", tags=["Download"])

@app.get("/")
async def root():
    return {
        "message": "FitMyCV API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
