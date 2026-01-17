from fastapi import APIRouter, HTTPException
from app.schemas.resume import JobDescriptionInput, JobDescriptionResponse
from app.services.job_scraper import get_job_scraper
from app.services.ai_adapter import get_ai_adapter

router = APIRouter()


@router.post("/", response_model=JobDescriptionResponse)
async def scrape_job_offer(job_data: JobDescriptionInput):
    """
    Scrape job offer from URL or parse provided description.
    Supports LinkedIn, InfoJobs, Indeed, Glassdoor, and generic sites.
    """
    scraper = get_job_scraper()

    if job_data.description:
        # If description is provided directly, parse it
        result = scraper.parse_text_description(job_data.description)
    elif job_data.url:
        # Scrape from URL
        result = await scraper.scrape_job_posting(job_data.url)
    else:
        raise HTTPException(
            status_code=400,
            detail="Either URL or description is required"
        )

    # Use AI to enhance the extraction if we have enough content
    if result.get("description") and len(result["description"]) > 100:
        try:
            ai = get_ai_adapter()
            job_details = await ai.extract_job_details(
                result["description"],
                job_data.url
            )
            # Merge AI results with scraped results
            result["required_skills"] = job_details.get("required_skills", [])
            result["experience_level"] = job_details.get("experience_level")
            result["years_of_experience"] = job_details.get("years_of_experience")
        except Exception:
            # AI enhancement is optional, continue without it
            pass

    return JobDescriptionResponse(
        title=result.get("title", "Job Position"),
        description=result.get("description", ""),
        company=result.get("company"),
        location=result.get("location"),
        keywords=result.get("keywords", []),
        skills=result.get("skills", []),
        requirements=result.get("requirements", []),
        nice_to_have=[]  # Could be enhanced with AI
    )


@router.post("/analyze-url")
async def analyze_job_url(url: str):
    """
    Quick analysis of a job URL to extract basic information
    without full scraping.
    """
    scraper = get_job_scraper()
    site = scraper.detect_site(url)

    return {
        "site": site,
        "supported": site != "generic",
        "url": url
    }
