"""
Expert CV optimization prompts based on industry best practices.
This module contains professional knowledge for creating exceptional CVs.
"""

from typing import Dict, List, Optional


class CVPromptExpert:
    """
    Expert knowledge base for CV optimization.
    Based on insights from career coaches, recruiters, and ATS systems.
    """

    # Best practices for CV writing
    CV_BEST_PRACTICES = """
    ## Professional CV Best Practices (2025)
    
    ### ATS Optimization
    - Use standard section headings: Experience, Education, Skills, Projects
    - Avoid tables, images, headers/footers that ATS can't parse
    - Use common fonts: Arial, Calibri, Times New Roman
    - Save in .docx format for best compatibility
    - Include keywords naturally throughout the CV
    - Use full spellings of acronyms at least once
    
    ### Content Structure
    - Start with a compelling professional summary (2-4 lines)
    - Use reverse chronological order (most recent first)
    - Include measurable achievements (metrics, percentages, numbers)
    - Use strong action verbs: Led, Developed, Implemented, Optimized
    - Tailor content to match job requirements
    - Keep to 1-2 pages maximum
    
    ### Writing Style
    - Write in active voice, not passive
    - Remove personal pronouns (I, me, my)
    - Be specific and concrete, not vague
    - Focus on results and impact, not just responsibilities
    - Use consistent formatting and tense
    - Proofread for grammar and spelling
    
    ### Technical CVs Specific
    - List technologies in order of relevance to the job
    - Include years of experience with key technologies
    - Highlight relevant projects with tech stack
    - Mention certifications and continuous learning
    - Show problem-solving and architectural decisions
    """

    # Action verbs by category
    ACTION_VERBS = {
        "leadership": [
            "Led", "Directed", "Managed", "Coordinated", "Supervised", 
            "Mentored", "Guided", "Facilitated", "Orchestrated", "Delegated"
        ],
        "achievement": [
            "Achieved", "Exceeded", "Delivered", "Accomplished", "Completed",
            "Improved", "Increased", "Reduced", "Optimized", "Enhanced"
        ],
        "creation": [
            "Developed", "Created", "Built", "Designed", "Implemented",
            "Established", "Launched", "Initiated", "Engineered", "Architected"
        ],
        "analysis": [
            "Analyzed", "Evaluated", "Assessed", "Investigated", "Researched",
            "Identified", "Diagnosed", "Examined", "Measured", "Reviewed"
        ],
        "collaboration": [
            "Collaborated", "Partnered", "Contributed", "Cooperated", "Interfaced",
            "Consulted", "Communicated", "Presented", "Negotiated", "Liaised"
        ]
    }

    # Common mistakes to avoid
    COMMON_MISTAKES = [
        "Using generic descriptions without specific achievements",
        "Including irrelevant personal information (age, photo in some countries)",
        "Listing job duties instead of accomplishments",
        "Using passive voice ('was responsible for' vs 'developed')",
        "Including outdated or irrelevant skills",
        "Poor formatting that's hard to read",
        "Typos and grammatical errors",
        "Missing keywords from job description",
        "Too long or too short",
        "Unprofessional email address"
    ]

    # Industry-specific keywords
    INDUSTRY_KEYWORDS = {
        "software_engineering": [
            "full-stack", "microservices", "API", "CI/CD", "agile", "scrum",
            "version control", "code review", "testing", "debugging", "deployment",
            "scalability", "performance optimization", "architecture", "design patterns"
        ],
        "data_science": [
            "machine learning", "deep learning", "neural networks", "data analysis",
            "statistical modeling", "data visualization", "big data", "ETL",
            "feature engineering", "model deployment", "A/B testing"
        ],
        "frontend": [
            "responsive design", "user experience", "web performance", "accessibility",
            "component library", "state management", "cross-browser compatibility",
            "SEO", "mobile-first", "progressive web app"
        ],
        "backend": [
            "RESTful API", "GraphQL", "database design", "authentication",
            "security", "caching", "message queues", "serverless", "containerization",
            "load balancing", "distributed systems"
        ],
        "devops": [
            "infrastructure as code", "continuous deployment", "monitoring",
            "observability", "container orchestration", "cloud infrastructure",
            "automation", "configuration management", "disaster recovery"
        ]
    }

    @classmethod
    def get_enhanced_system_prompt(cls, tone: str = "professional") -> str:
        """
        Generate an enhanced system prompt with expert CV knowledge.
        
        Args:
            tone: The tone to use (professional, casual, confident)
            
        Returns:
            Enhanced system prompt string
        """
        tone_instructions = {
            "professional": "Use professional, corporate language. Be formal but approachable. Focus on achievements and impact.",
            "casual": "Use a friendly, conversational tone while maintaining professionalism. Show personality while staying credible.",
            "confident": "Use strong, action-oriented language. Emphasize achievements and leadership. Be bold and assertive."
        }

        return f"""You are an elite CV writer and career strategist with 20+ years of experience helping candidates land their dream jobs at top companies (FAANG, startups, Fortune 500).

Your expertise includes:
- Applicant Tracking System (ATS) optimization
- Modern CV formatting and structure
- Achievement-focused writing
- Keyword optimization
- Industry-specific tailoring
- Quantifiable results emphasis

{cls.CV_BEST_PRACTICES}

## Your Task
Adapt and optimize the candidate's CV for the target position while:
1. Maintaining 100% honesty - never invent experience or skills
2. Highlighting relevant experience and transferable skills
3. Using industry-standard keywords naturally
4. Quantifying achievements wherever possible
5. Ensuring ATS compatibility
6. {tone_instructions.get(tone, tone_instructions["professional"])}

## Critical Requirements
- Respond ONLY with valid JSON (no additional text)
- Use strong action verbs from the appropriate categories
- Focus on impact and results, not just responsibilities
- Tailor content specifically to the job requirements
- Remove or minimize irrelevant information
- Ensure consistency in formatting and tense

## Common Pitfalls to Avoid
{chr(10).join(f'- {mistake}' for mistake in cls.COMMON_MISTAKES)}

Remember: A great CV tells a story of impact, growth, and value. Every bullet point should answer: "So what? What was the impact?"
"""

    @classmethod
    def get_section_specific_guidance(cls, section: str) -> str:
        """Get specific guidance for different CV sections"""
        guidance = {
            "summary": """
            Professional Summary Best Practices:
            - 2-4 lines maximum
            - Include: years of experience, key expertise, specialization
            - Highlight: 1-2 major achievements or unique value propositions
            - Match: key requirements from job description
            - Example: "Senior Full-Stack Engineer with 7+ years building scalable web applications. 
              Specialized in React/Node.js with proven track record of reducing load times by 40% 
              and leading teams of 5+ developers."
            """,
            "experience": """
            Experience Section Best Practices:
            - Use reverse chronological order
            - Format: Company Name, Job Title, Dates (Month Year - Month Year)
            - 3-5 bullet points per role
            - Start each bullet with a strong action verb
            - Include metrics: "Increased X by Y%", "Reduced Z by N hours"
            - Focus on achievements, not duties
            - Tailor bullets to match job requirements
            - Use STAR method: Situation, Task, Action, Result
            """,
            "skills": """
            Skills Section Best Practices:
            - Categorize: Programming Languages, Frameworks, Tools, Methodologies
            - List most relevant skills first
            - Include proficiency level if requested
            - Match keywords from job description
            - Be honest - only include what you can discuss in interview
            - Keep updated and remove obsolete technologies
            - Consider: Expert, Advanced, Intermediate, Familiar
            """,
            "projects": """
            Projects Section Best Practices:
            - Include for junior roles or career changers
            - Format: Project Name, Tech Stack, Brief Description
            - Highlight: Problem solved, your role, technologies used, impact
            - Include links to GitHub/live demos if available
            - Focus on projects relevant to target role
            - Quantify impact: users, performance improvements, contributions
            - Show problem-solving and technical decision-making
            """
        }
        return guidance.get(section, "")

    @classmethod
    def get_industry_keywords(cls, industry: str) -> List[str]:
        """Get relevant keywords for a specific industry"""
        return cls.INDUSTRY_KEYWORDS.get(industry.lower(), [])

    @classmethod
    def suggest_action_verbs(cls, category: str) -> List[str]:
        """Suggest appropriate action verbs by category"""
        return cls.ACTION_VERBS.get(category.lower(), cls.ACTION_VERBS["achievement"])

    @classmethod
    def analyze_cv_quality(cls, cv_text: str) -> Dict[str, any]:
        """
        Analyze CV quality and provide improvement suggestions.
        
        Args:
            cv_text: The CV text to analyze
            
        Returns:
            Dictionary with quality metrics and suggestions
        """
        issues = []
        score = 100
        
        # Check for passive voice indicators
        passive_indicators = ["was responsible for", "were responsible for", "was tasked with"]
        for indicator in passive_indicators:
            if indicator in cv_text.lower():
                issues.append(f"Uses passive voice: '{indicator}' - consider rewriting in active voice")
                score -= 5
        
        # Check for action verbs
        has_action_verbs = any(
            verb.lower() in cv_text.lower() 
            for category in cls.ACTION_VERBS.values() 
            for verb in category
        )
        if not has_action_verbs:
            issues.append("Missing strong action verbs - consider adding achievement-focused language")
            score -= 10
        
        # Check for quantifiable metrics
        has_metrics = any(char.isdigit() for char in cv_text)
        if not has_metrics:
            issues.append("No quantifiable achievements found - add metrics, percentages, or numbers")
            score -= 15
        
        # Check length (rough estimate)
        word_count = len(cv_text.split())
        if word_count < 200:
            issues.append("CV seems too short - consider adding more detail about achievements")
            score -= 10
        elif word_count > 1500:
            issues.append("CV might be too long - consider condensing to 1-2 pages")
            score -= 5
        
        return {
            "score": max(0, score),
            "issues": issues,
            "word_count": word_count,
            "has_metrics": has_metrics,
            "has_action_verbs": has_action_verbs
        }


# Convenience function for backward compatibility
def get_expert_system_prompt(tone: str = "professional") -> str:
    """Get the enhanced system prompt with expert CV knowledge"""
    return CVPromptExpert.get_enhanced_system_prompt(tone)
