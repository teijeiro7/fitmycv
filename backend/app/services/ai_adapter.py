"""
AI-powered CV adaptation service.
Supports OpenAI, Anthropic (Claude), and OpenRouter as providers.
"""
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

from openai import OpenAI
from anthropic import Anthropic

from app.core.config import settings
from app.services.cv_prompts import CVPromptExpert


class AIAdapter:
    """Service for adapting CVs using AI"""

    def __init__(self, provider: Optional[str] = None):
        """
        Initialize the AI adapter.

        Args:
            provider: AI provider to use ("openai", "anthropic", or "openrouter"). 
                     Defaults to settings.AI_PROVIDER
        """
        self.provider = provider or settings.AI_PROVIDER

        if self.provider == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY is not configured")
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = settings.ANTHROPIC_MODEL
        elif self.provider == "openrouter":
            if not settings.OPENROUTER_API_KEY:
                raise ValueError("OPENROUTER_API_KEY is not configured")
            # OpenRouter uses OpenAI-compatible API
            self.client = OpenAI(
                api_key=settings.OPENROUTER_API_KEY,
                base_url=settings.OPENROUTER_BASE_URL
            )
            self.model = settings.OPENROUTER_MODEL
        else:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is not configured")
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            self.model = settings.OPENAI_MODEL

    def _create_system_prompt(self, tone: str = "professional") -> str:
        """Create the system prompt for CV adaptation using expert knowledge"""
        return CVPromptExpert.get_enhanced_system_prompt(tone)

    async def adapt_resume(
        self,
        resume_text: str,
        parsed_sections: Dict[str, str],
        job_description: str,
        job_title: str,
        job_company: Optional[str] = None,
        job_location: Optional[str] = None,
        target_keywords: Optional[List[str]] = None,
        github_projects: Optional[List[Dict]] = None,
        tone: str = "professional"
    ) -> Dict[str, Any]:
        """
        Adapt a resume for a specific job application.

        Args:
            resume_text: Full text of the original resume
            parsed_sections: Parsed sections of the resume
            job_description: The job description to adapt for
            job_title: Target job title
            job_company: Target company name (optional)
            job_location: Job location (optional)
            target_keywords: Specific keywords to emphasize
            github_projects: GitHub projects to include
            tone: Tone of the adapted resume

        Returns:
            Dictionary with adapted content and metadata
        """
        # Build the prompt
        user_prompt = self._build_adaptation_prompt(
            resume_text, parsed_sections, job_description, job_title,
            job_company, job_location, target_keywords, github_projects
        )

        # Call the AI
        response = await self._call_ai(user_prompt, tone)

        return response

    def _build_adaptation_prompt(
        self,
        resume_text: str,
        parsed_sections: Dict[str, str],
        job_description: str,
        job_title: str,
        job_company: Optional[str],
        job_location: Optional[str],
        target_keywords: Optional[List[str]],
        github_projects: Optional[List[Dict]]
    ) -> str:
        """Build the user prompt for CV adaptation"""

        # Detect language from job description and location
        is_english_job = self._is_english_job(job_description, job_location)
        target_language = "English" if is_english_job else "Spanish"
        language_code = "en" if is_english_job else "es"

        prompt_parts = [
            f"Please adapt the following resume for this job application:\n",
            f"\n## Target Position\n",
            f"**Job Title:** {job_title}"
        ]

        if job_company:
            prompt_parts.append(f"**Company:** {job_company}")
        if job_location:
            prompt_parts.append(f"**Location:** {job_location}")

        prompt_parts.extend([
            f"\n## Job Description\n",
            job_description,
            f"\n## Current Resume\n",
            f"### Full Text\n",
            resume_text,
            f"\n### Parsed Sections\n",
            json.dumps(parsed_sections, indent=2, ensure_ascii=False)
        ])

        if target_keywords:
            prompt_parts.extend([
                f"\n## Target Keywords to Emphasize\n",
                ", ".join(target_keywords)
            ])

        if github_projects:
            projects_text = "\n".join([
                f"- {p['name']}: {p.get('description', 'No description')}\n"
                f"  Technologies: {', '.join(p.get('languages', {}).keys())}\n"
                f"  URL: {p['url']}"
                for p in github_projects
            ])
            prompt_parts.extend([
                f"\n## GitHub Projects to Consider Including\n",
                projects_text
            ])

        prompt_parts.extend([
            f"\n## Instructions\n",
            f"1. Extract the candidate's NAME and PROFESSIONAL TITLE from the resume\n",
            f"2. Analyze the job requirements and identify key skills and qualifications\n",
            f"3. Match the candidate's experience to these requirements\n",
            f"4. Adapt each section of the resume to better fit the position\n",
            f"5. Identify which GitHub projects (if any) should be highlighted based on their relevance to the job\n",
            f"6. Calculate a match score (0-100) based on how well the candidate fits\n",
            f"7. IMPORTANT: Write the adapted CV in {target_language} because",
            f"{' the job description is in English and/or the company location indicates English is preferred' if is_english_job else ' the job description is in Spanish and/or the company location indicates Spanish is preferred'}\n",
            f"8. Return your response as JSON with the following structure:\n",
            json.dumps({
                "match_score": "0-100 score",
                "language": target_language,
                "language_reason": f"Selected {target_language} because {'job is English-speaking' if is_english_job else 'job is Spanish-speaking'}",
                "keywords_added": ["list", "of", "keywords", "emphasized"],
                "keywords_missing": ["required", "keywords", "not", "in", "resume"],
                "selected_github_projects": [
                    {
                        "name": "Project name",
                        "reason": "Why this project was selected (e.g., 'Uses React which is required for the job')"
                    }
                ] if github_projects else [],
                "optimized_content": {
                    "name": "Candidate's full name extracted from resume",
                    "title": "Professional title (e.g., 'Senior Software Engineer')",
                    "summary": f"Adapted professional summary in {target_language} (2-3 sentences)",
                    "experience": [
                        {
                            "title": "Job title",
                            "company": "Company name",
                            "date": "Date range (e.g., 'Jan 2020 - Present')",
                            "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
                        }
                    ],
                    "skills": ["Skill1", "Skill2", "Skill3", "etc"],
                    "education": [
                        {
                            "degree": "Degree name",
                            "school": "School name",
                            "year": "Graduation year"
                        }
                    ]
                },
                "changes_made": ["List", "of", "key", "changes", "made"],
                "recommendations": ["List", "of", "additional", "recommendations"]
            }, indent=2)
        ])

        return "\n".join(prompt_parts)

    def _is_english_job(self, job_description: str, job_location: Optional[str]) -> bool:
        """Determine if the job is English-speaking based on description and location"""
        job_desc_lower = job_description.lower()

        # Check for Spanish keywords that indicate a Spanish job
        spanish_keywords = ['buscamos', 'buscamos+', 'se busca', 'buscamos', 'buscamos talentos',
                          'empleo', 'trabajo', 'vacante', 'salario', 'jornada', 'contrato',
                          'incorporación', 'incorporar', 'candidate', 'candidatura',
                          'empresa española', 'madrid', 'barcelona', 'valencia', 'sevilla',
                          'bilbao', 'españa', 'spain']

        # Check for English keywords that indicate an English job
        english_keywords = ['we are looking', 'looking for', 'join our team', 'we are seeking',
                          'engineering manager', 'software engineer', 'product manager',
                          'data scientist', 'full stack', 'frontend', 'backend',
                          'united states', 'usa', 'uk', 'united kingdom', 'london',
                          'new york', 'san francisco', 'remote - us', 'remote us']

        # Count Spanish keywords
        spanish_count = sum(1 for keyword in spanish_keywords if keyword in job_desc_lower)

        # If location is provided, check for Spanish locations
        if job_location:
            location_lower = job_location.lower()
            if any(city in location_lower for city in ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao', 'españa', 'spain']):
                return False  # Spanish job
            if any(city in location_lower for city in ['usa', 'uk', 'united states', 'london', 'united kingdom', 'new york', 'san francisco', 'remote us']):
                return True  # English job

        # If Spanish keywords dominate, it's a Spanish job
        if spanish_count >= 3:
            return False

        # Default to English for tech jobs unless clearly Spanish
        return True

    async def _call_ai(self, prompt: str, tone: str) -> Dict[str, Any]:
        """Call the AI API and return the parsed response"""
        system_prompt = self._create_system_prompt(tone)

        try:
            if self.provider == "anthropic":
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                content = response.content[0].text
            elif self.provider == "openrouter":
                # OpenRouter uses OpenAI-compatible API
                # Add extra headers for better tracking
                extra_headers = {
                    "HTTP-Referer": settings.OPENROUTER_SITE_URL,
                    "X-Title": settings.OPENROUTER_APP_NAME,
                }
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=4096,
                    extra_headers=extra_headers
                )
                content = response.choices[0].message.content
            else:  # OpenAI
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=4096
                )
                content = response.choices[0].message.content

            # Parse the JSON response
            # Sometimes AI adds markdown code blocks, so we need to extract JSON
            content = content.strip()
            if content.startswith("```"):
                # Remove markdown code block markers
                lines = content.split("\n")
                content = "\n".join(lines[1:-1])

            result = json.loads(content)
            return result

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}\n\nResponse was: {content[:500]}")
        except Exception as e:
            raise ValueError(f"Error calling AI API: {str(e)}")

    async def extract_job_details(
        self,
        job_description: str,
        job_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract structured information from a job description.

        Args:
            job_description: Raw job description text
            job_url: URL of the job posting (for context)

        Returns:
            Dictionary with extracted job details
        """
        system_prompt = """You are an expert recruiter and job analyst.
Extract key information from job descriptions and structure it.
Respond ONLY with valid JSON, no additional text."""

        user_prompt = f"""Extract the following information from this job description:

{job_description}

Return a JSON object with this structure:
{{
    "title": "Job title",
    "company": "Company name if mentioned",
    "location": "Location if mentioned",
    "required_skills": ["skill1", "skill2", ...],
    "nice_to_have_skills": ["skill1", "skill2", ...],
    "experience_level": "entry/mid/senior/lead",
    "years_of_experience": number (or null),
    "education_requirements": ["requirement1", ...],
    "responsibilities": ["responsibility1", ...],
    "key_qualifications": ["qualification1", ...],
    "salary_range": "range if mentioned or null"
}}"""

        try:
            if self.provider == "anthropic":
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=2048,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}]
                )
                content = response.content[0].text
            elif self.provider == "openrouter":
                # OpenRouter uses OpenAI-compatible API
                extra_headers = {
                    "HTTP-Referer": settings.OPENROUTER_SITE_URL,
                    "X-Title": settings.OPENROUTER_APP_NAME,
                }
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=2048,
                    extra_headers=extra_headers
                )
                content = response.choices[0].message.content
            else:  # OpenAI
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=2048
                )
                content = response.choices[0].message.content

            # Clean and parse JSON
            content = content.strip()
            if content.startswith("```"):
                lines = content.split("\n")
                content = "\n".join(lines[1:-1])

            return json.loads(content)

        except Exception as e:
            # Fallback to basic extraction
            return {
                "title": "",
                "company": "",
                "location": "",
                "required_skills": [],
                "nice_to_have_skills": [],
                "experience_level": None,
                "years_of_experience": None,
                "education_requirements": [],
                "responsibilities": [],
                "key_qualifications": [],
                "salary_range": None
            }

    async def analyze_github_repos_for_job(
        self,
        repos: List[Dict],
        job_requirements: Dict
    ) -> List[Dict]:
        """
        Analyze GitHub repositories and rank them by relevance to a job.

        Args:
            repos: List of GitHub repository data
            job_requirements: Job requirements dict

        Returns:
            List of repos with relevance scores and recommendations
        """
        required_skills = job_requirements.get("required_skills", [])

        if not required_skills:
            return []

        # For each repo, calculate relevance score
        analyzed_repos = []
        for repo in repos:
            score = 0
            reasons = []

            # Check primary language
            repo_lang = repo.get("language", "").lower()
            for skill in required_skills:
                if repo_lang and (repo_lang in skill.lower() or skill.lower() in repo_lang):
                    score += 30
                    reasons.append(f"Primary language ({repo_lang}) matches requirement: {skill}")
                    break

            # Check all languages
            languages = repo.get("languages", {})
            for lang in languages.keys():
                for skill in required_skills:
                    if lang.lower() in skill.lower() or skill.lower() in lang.lower():
                        if not any(f"Primary language" in r for r in reasons):
                            score += 15
                            reasons.append(f"Language ({lang}) matches requirement: {skill}")

            # Check topics
            topics = repo.get("topics", [])
            for topic in topics:
                for skill in required_skills:
                    if topic.lower() in skill.lower() or skill.lower() in topic.lower():
                        score += 10
                        reasons.append(f"Topic ({topic}) matches requirement: {skill}")

            # Check description
            description = repo.get("description", "")
            if description:
                for skill in required_skills:
                    if skill.lower() in description.lower():
                        score += 5
                        reasons.append(f"Description mentions: {skill}")

            # Factor in stars (slight boost for popular repos)
            stars = repo.get("stars", 0)
            if stars > 10:
                score += min(5, stars // 10)

            analyzed_repos.append({
                **repo,
                "relevance_score": min(100, score),
                "relevance_reasons": reasons,
                "should_include": score >= 30
            })

        # Sort by relevance score
        analyzed_repos.sort(key=lambda x: x["relevance_score"], reverse=True)
        return analyzed_repos


def get_ai_adapter() -> AIAdapter:
    """Factory function to get an AI adapter instance"""
    return AIAdapter()
