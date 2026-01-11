from fastapi import APIRouter, HTTPException
from playwright.async_api import async_playwright
from app.schemas.resume import JobDescriptionInput, JobDescriptionResponse

router = APIRouter()

@router.post("/", response_model=JobDescriptionResponse)
async def scrape_job_offer(job_data: JobDescriptionInput):
    """Scrape job offer from URL or use provided description"""
    
    if job_data.description:
        # If description is provided directly, just parse it
        return {
            "title": "Manual Entry",
            "description": job_data.description,
            "keywords": extract_keywords(job_data.description),
            "skills": extract_skills(job_data.description)
        }
    
    if not job_data.url:
        raise HTTPException(status_code=400, detail="Either URL or description is required")
    
    # Scrape from URL
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(job_data.url, wait_until='networkidle')
            
            # Extract content (this is a generic approach, may need customization per site)
            title = await page.title()
            content = await page.content()
            
            # Extract text from common job posting selectors
            job_description = await page.evaluate('''() => {
                const selectors = [
                    '.description',
                    '.job-description',
                    '[class*="description"]',
                    '[id*="description"]',
                    'article',
                    'main'
                ];
                
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        return element.innerText;
                    }
                }
                return document.body.innerText;
            }''')
            
            await browser.close()
            
            return {
                "title": title,
                "description": job_description,
                "keywords": extract_keywords(job_description),
                "skills": extract_skills(job_description)
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error scraping job offer: {str(e)}"
        )

def extract_keywords(text: str) -> list[str]:
    """Extract keywords from text (simplified version)"""
    # TODO: Implement proper NLP keyword extraction
    common_keywords = [
        "python", "javascript", "react", "fastapi", "sql", "docker",
        "kubernetes", "aws", "azure", "agile", "scrum", "jira",
        "leadership", "communication", "problem-solving"
    ]
    
    text_lower = text.lower()
    found_keywords = [kw for kw in common_keywords if kw in text_lower]
    return found_keywords

def extract_skills(text: str) -> list[str]:
    """Extract technical skills from text"""
    # TODO: Implement proper skill extraction
    return extract_keywords(text)  # Simplified for now
