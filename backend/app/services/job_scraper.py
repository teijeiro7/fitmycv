"""
Web scraping service for extracting job details from various job portals.
Supports LinkedIn, InfoJobs, and other popular job sites.
"""
import re
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright, Page
from bs4 import BeautifulSoup

from app.core.config import settings


class JobScraper:
    """Service for scraping job postings from various portals"""

    # Site-specific selectors
    SELECTORS = {
        "linkedin": {
            "title": "h1.top-card-layout__title",
            "company": ".topcard__org-name-link, .top-card-layout__card a",
            "location": ".topcard__flavor-row span:last-child",
            "description": ".show-more-less-html__markup",
            "skills": ".job-criteria__item",
        },
        "infojobs": {
            "title": "h1.rf-offer-title",
            "company": ".rf-company_details a",
            "location": ".rf-jDetails-location .rf-jDetails__location",
            "description": ".rf-offer-description",
            "requirements": ".rf-offer-requirements",
            "skills": ".rf-tag",
        },
        "indeed": {
            "title": "h1.jobtitle",
            "company": ".companyName",
            "location": ".jobLocation",
            "description": "#jobDescriptionText",
            "skills": ".skill-item",
        },
        "glassdoor": {
            "title": "div.css-17cd5g0",
            "company": "div.css-16kyo5v",
            "location": "div.css-1vwe2a6",
            "description": "div.jobDescriptionContent",
            "skills": ".skill-tag",
        },
        "generic": {
            # Generic selectors that work on many sites
            "title": ["h1", "[class*='title']", "[id*='title']"],
            "description": [
                "[class*='description']",
                "[id*='description']",
                "article",
                "main",
                ".job-description",
                ".job-details",
                ".posting-description"
            ],
        }
    }

    @staticmethod
    def detect_site(url: str) -> str:
        """Detect the job site from URL"""
        domain = urlparse(url).netloc.lower()

        if "linkedin" in domain:
            return "linkedin"
        elif "infojobs" in domain:
            return "infojobs"
        elif "indeed" in domain:
            return "indeed"
        elif "glassdoor" in domain:
            return "glassdoor"
        else:
            return "generic"

    @staticmethod
    def clean_text(text: str) -> str:
        """Clean extracted text"""
        if not text:
            return ""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters that might cause issues
        text = text.replace('\xa0', ' ')
        text = text.replace('\u200b', '')
        return text.strip()

    @staticmethod
    def extract_keywords_from_text(text: str) -> List[str]:
        """Extract technical keywords and skills from job description"""
        # Common technical skills and keywords
        tech_keywords = [
            # Programming languages
            "python", "java", "javascript", "typescript", "c\\+\\+", "c#", "ruby", "php",
            "swift", "kotlin", "go", "rust", "scala", "r", "matlab",

            # Frameworks & libraries
            "react", "angular", "vue", "next.js", "nuxt", "svelte",
            "django", "flask", "fastapi", "spring", "express", "nest.js",
            ".net", "laravel", "rails", "symfony",

            # Data & ML
            "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
            "spark", "hadoop", "airflow", "tableau", "power bi", "looker",

            # Cloud & DevOps
            "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
            "jenkins", "gitlab", "github actions", "ci/cd", "devops",

            # Databases
            "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
            "dynamodb", "cassandra", "graphql", "rest api", "grpc",

            # Other
            "agile", "scrum", "kanban", "jira", "confluence", "git",
            "linux", "unix", "windows", "macos",
            "microservices", "api", "rest", "graphql", "websocket",
            "tdd", "bdd", "unit testing", "integration testing",
            "ci/cd", "devops", "site reliability", "sre"
        ]

        found_keywords = []
        text_lower = text.lower()

        for keyword in tech_keywords:
            if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', text_lower):
                found_keywords.append(keyword)

        # Also extract capitalized words that might be proprietary technologies
        # This catches things like "Salesforce", "SAP", etc.
        capitalized = re.findall(r'\b[A-Z][a-zA-Z]+\b', text)
        # Filter out common words
        common_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
                       'had', 'her', 'was', 'one', 'our', 'out', 'with', 'This', 'That',
                       'The', 'And', 'For', 'Are', 'But', 'Not', 'You', 'All', 'Can'}
        unique_capitalized = [w for w in set(capitalized)
                             if w.lower() not in common_words and len(w) > 2]

        # Add capitalized words that appear multiple times (likely important)
        from collections import Counter
        cap_counts = Counter(capitalized)
        for word, count in cap_counts.items():
            if count >= 2 and word not in found_keywords and len(word) > 3:
                found_keywords.append(word)

        return list(set(found_keywords))

    @staticmethod
    def extract_requirements(text: str) -> List[str]:
        """Extract requirements from job description"""
        requirements = []

        # Look for common requirement section patterns
        patterns = [
            r'(?:Requirements|Qualifications|Required Skills):(.*?)(?:\n\n|\n[A-Z][a-z]+:|$)',
            r'(?:Requisitos|Requerimientos):(.*?)(?:\n\n|\n[A-Z][a-z]+:|$)',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            for match in matches:
                # Extract bullet points or numbered items
                items = re.findall(r'[•\-\*o]\s*([^\n]+)|\d+\.\s*([^\n]+)', match)
                for item in items:
                    req = (item[0] or item[1]).strip()
                    if req and len(req) > 5:
                        requirements.append(req)

        return requirements[:10]  # Limit to 10 requirements

    async def scrape_job_posting(self, url: str) -> Dict[str, Any]:
        """
        Scrape job posting from URL.

        Args:
            url: URL of the job posting

        Returns:
            Dictionary with job details
        """
        site = self.detect_site(url)

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent=settings.SCRAPER_USER_AGENT,
                    viewport={"width": 1920, "height": 1080}
                )
                page = await context.new_page()

                # Navigate to URL
                await page.goto(url, wait_until='networkidle', timeout=settings.SCRAPER_TIMEOUT)

                # Wait a bit for dynamic content
                await page.wait_for_timeout(2000)

                # Extract data
                if site == "linkedin":
                    data = await self._scrape_linkedin(page)
                elif site == "infojobs":
                    data = await self._scrape_infojobs(page)
                elif site == "indeed":
                    data = await self._scrape_indeed(page)
                else:
                    data = await self._scrape_generic(page)

                # Post-process with AI for better extraction
                data["keywords"] = self.extract_keywords_from_text(data.get("description", ""))
                data["skills"] = data.get("skills", []) + data["keywords"]
                data["skills"] = list(set(data["skills"]))  # Remove duplicates
                data["requirements"] = self.extract_requirements(data.get("description", ""))

                await browser.close()
                return data

        except Exception as e:
            # Return partial data on error
            return {
                "title": "",
                "company": "",
                "location": "",
                "description": f"Error scraping job: {str(e)}",
                "skills": [],
                "requirements": [],
                "url": url
            }

    async def _scrape_linkedin(self, page: Page) -> Dict[str, Any]:
        """Scrape LinkedIn job posting"""
        selectors = self.SELECTORS["linkedin"]

        title = await self._extract_text(page, selectors["title"])
        company = await self._extract_text(page, selectors["company"])
        location = await self._extract_text(page, selectors["location"])
        description = await self._extract_text(page, selectors["description"])

        # Extract skills from sidebar
        skills_elements = await page.query_selector_all(selectors["skills"])
        skills = []
        for el in skills_elements:
            text = await el.inner_text()
            if text and ":" in text:
                skill = text.split(":")[-1].strip()
                if skill:
                    skills.append(skill)

        return {
            "title": self.clean_text(title),
            "company": self.clean_text(company),
            "location": self.clean_text(location),
            "description": self.clean_text(description),
            "skills": skills,
            "source": "linkedin"
        }

    async def _scrape_infojobs(self, page: Page) -> Dict[str, Any]:
        """Scrape InfoJobs job posting"""
        selectors = self.SELECTORS["infojobs"]

        title = await self._extract_text(page, selectors["title"])
        company = await self._extract_text(page, selectors["company"])
        location = await self._extract_text(page, selectors["location"])
        description = await self._extract_text(page, selectors["description"])

        # Extract tags/skills
        tags = await page.query_selector_all(selectors["skills"])
        skills = []
        for tag in tags:
            text = await tag.inner_text()
            if text:
                skills.append(self.clean_text(text))

        return {
            "title": self.clean_text(title),
            "company": self.clean_text(company),
            "location": self.clean_text(location),
            "description": self.clean_text(description),
            "skills": skills,
            "source": "infojobs"
        }

    async def _scrape_indeed(self, page: Page) -> Dict[str, Any]:
        """Scrape Indeed job posting"""
        selectors = self.SELECTORS["indeed"]

        title = await self._extract_text(page, selectors["title"])
        company = await self._extract_text(page, selectors["company"])
        location = await self._extract_text(page, selectors["location"])
        description = await self._extract_text(page, selectors["description"])

        return {
            "title": self.clean_text(title),
            "company": self.clean_text(company),
            "location": self.clean_text(location),
            "description": self.clean_text(description),
            "skills": [],
            "source": "indeed"
        }

    async def _scrape_generic(self, page: Page) -> Dict[str, Any]:
        """Scrape generic job posting using multiple selector strategies"""
        selectors = self.SELECTORS["generic"]

        # Try multiple selectors for each field
        title = await self._extract_text_fallback(page, selectors["title"])
        description = await self._extract_text_fallback(page, selectors["description"])

        # Try to find company in meta tags
        company = ""
        meta_og = await page.query_selector("meta[property='og:site_name']")
        if meta_og:
            company = await meta_og.get_attribute("content")

        # Try to find location
        location = ""

        return {
            "title": self.clean_text(title),
            "company": self.clean_text(company),
            "location": self.clean_text(location),
            "description": self.clean_text(description),
            "skills": [],
            "source": "generic"
        }

    async def _extract_text(self, page: Page, selector: str) -> str:
        """Extract text from a single element"""
        try:
            element = await page.query_selector(selector)
            if element:
                return await element.inner_text()
        except:
            pass
        return ""

    async def _extract_text_fallback(self, page: Page, selectors: List[str]) -> str:
        """Extract text trying multiple selectors"""
        for selector in selectors:
            try:
                text = await self._extract_text(page, selector)
                if text and len(text) > 5:
                    return text
            except:
                continue
        return ""

    def parse_text_description(self, description: str) -> Dict[str, Any]:
        """
        Parse a plain text job description (for manually entered descriptions).

        Args:
            description: Raw job description text

        Returns:
            Structured job details
        """
        keywords = self.extract_keywords_from_text(description)
        requirements = self.extract_requirements(description)

        # Try to extract title from first line
        lines = description.strip().split('\n')
        title = lines[0] if lines else "Job Position"

        return {
            "title": title,
            "company": "",
            "location": "",
            "description": description,
            "skills": keywords,
            "requirements": requirements,
            "keywords": keywords,
            "source": "manual"
        }


def get_job_scraper() -> JobScraper:
    """Factory function to get a JobScraper instance"""
    return JobScraper()
