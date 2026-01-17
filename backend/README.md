# FitMyCV Backend

FastAPI-based backend for the FitMyCV AI-powered resume adaptation platform.

## Features

### Authentication
- JWT-based authentication
- OAuth 2.0 integration (Google, GitHub)
- User registration and login

### Resume Management
- Upload resumes (PDF and DOCX support)
- Automatic text extraction and parsing
- Resume history and management

### Job Scraping
- Specialized scrapers for:
  - LinkedIn
  - InfoJobs
  - Indeed
  - Glassdoor
  - Generic sites
- AI-enhanced job data extraction

### AI-Powered Adaptation
- OpenAI GPT-4o integration
- Anthropic Claude integration
- Resume optimization for specific job postings
- Keyword matching and skill analysis
- Match score calculation

### GitHub Integration
- OAuth connection to GitHub
- Repository synchronization
- Language and topic analysis
- Project relevance scoring for job applications

### Document Generation
- DOCX generation from optimized content
- PDF export (requires LibreOffice)
- Professional templates

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- (Optional) LibreOffice for PDF generation

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install Playwright browsers:
```bash
playwright install chromium
```

4. (Optional) Download spaCy model for advanced NLP:
```bash
python -m spacy download en_core_web_sm
```

5. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

6. Run database migrations:
```bash
alembic upgrade head
```

7. Start the server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### GitHub
- `GET /api/github/connect` - Initiate GitHub OAuth
- `GET /api/github/callback` - GitHub OAuth callback
- `POST /api/github/link` - Link GitHub account
- `POST /api/github/sync-repos` - Sync repositories
- `GET /api/github/repos` - List repositories
- `PUT /api/github/repos/{id}/toggle` - Toggle repo selection
- `DELETE /api/github/disconnect` - Disconnect GitHub
- `GET /api/github/status` - Get connection status
- `POST /api/github/repos/{id}/analyze` - Analyze repo for job

### Upload
- `POST /api/upload/` - Upload resume (PDF/DOCX)
- `GET /api/upload/` - List resumes
- `GET /api/upload/{id}` - Get resume details
- `DELETE /api/upload/{id}` - Delete resume
- `POST /api/upload/{id}/parse` - Re-parse resume

### Scraping
- `POST /api/scrape/` - Scrape job posting
- `POST /api/scrape/analyze-url` - Analyze job URL

### Optimization
- `POST /api/optimize/adapt` - Adapt resume to job
- `GET /api/optimize/history` - Get adaptation history
- `GET /api/optimize/{id}` - Get adaptation details
- `PUT /api/optimize/{id}` - Update adaptation
- `DELETE /api/optimize/{id}` - Delete adaptation
- `POST /api/optimize/{id}/generate-documents` - Generate files

### Download
- `GET /api/download/adaptation/{id}/docx` - Download DOCX
- `GET /api/download/adaptation/{id}/pdf` - Download PDF
- `GET /api/download/resume/{id}` - Download original resume

### Users
- `GET /api/users/me` - Get current user

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | JWT signing key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Recommended |
| `ANTHROPIC_API_KEY` | Anthropic API key | Optional |
| `AI_PROVIDER` | AI provider (openai/anthropic) | No (default: openai) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## Development

### Running tests
```bash
pytest
```

### Code formatting
```bash
black app/
isort app/
```

### Type checking
```bash
mypy app/
```

## Docker

Build and run with Docker Compose:
```bash
docker-compose up backend
```
