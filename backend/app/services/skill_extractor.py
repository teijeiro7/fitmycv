"""
Advanced skill extraction service using NLP techniques.
Uses spaCy for named entity recognition and pattern matching.
"""
import re
from typing import List, Dict, Set, Tuple, Optional
from collections import Counter

# Try to import spaCy, but make it optional
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False


# Comprehensive skill taxonomy
SKILL_TAXONOMY = {
    "programming_languages": {
        "python", "java", "javascript", "typescript", "c++", "csharp", "c#",
        "ruby", "php", "swift", "kotlin", "go", "golang", "rust", "scala",
        "r", "matlab", "julia", "dart", "lua", "perl", "haskell", "elixir",
        "clojure", "f#", "groovy", "objective-c", "sql", "html", "css"
    },
    "frameworks_libraries": {
        "react", "angular", "vue", "next.js", "nuxt", "svelte", "solidjs",
        "django", "flask", "fastapi", "spring boot", "spring", "express.js",
        "nest.js", "koa", "laravel", "rails", "ruby on rails", "symfony",
        ".net", "asp.net", "entity framework", "tensorflow", "pytorch", "keras",
        "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "plotly",
        "jquery", "bootstrap", "tailwind", "material-ui", "ant design"
    },
    "databases": {
        "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch",
        "dynamodb", "cassandra", "couchdb", "neo4j", "influxdb", "timescaledb",
        "mariadb", "oracle", "sql server", "firestore", "supabase"
    },
    "cloud_platforms": {
        "aws", "amazon web services", "azure", "gcp", "google cloud platform",
        "heroku", "digitalocean", "linode", "vultr", "alibaba cloud", "ibm cloud"
    },
    "devops_tools": {
        "docker", "kubernetes", "k8s", "terraform", "ansible", "chef", "puppet",
        "jenkins", "gitlab ci", "github actions", "circleci", "travis ci",
        "bamboo", "teamcity", "vagrant", "packer", "helm", "argocd"
    },
    "version_control": {
        "git", "github", "gitlab", "bitbucket", "svn", "mercurial", "cvs"
    },
    "testing": {
        "junit", "pytest", "jest", "mocha", "jasmine", "karma", "selenium",
        "cypress", "playwright", "testng", "rspec", "unittest", "jmeter"
    },
    "methodologies": {
        "agile", "scrum", "kanban", "waterfall", "lean", "tdd", "bdd",
        "devops", "ci/cd", "continuous integration", "continuous deployment",
        "pair programming", "code review", "extreme programming"
    },
    "architectural_patterns": {
        "microservices", "monolith", "serverless", "event-driven", "cqrs",
        "event sourcing", "domain driven design", "ddd", "soa", "mvc", "mvvm",
        "clean architecture", "hexagonal architecture", "rest api", "graphql",
        "grpc", "websocket", "saga pattern", "circuit breaker"
    },
    "data_engineering": {
        "apache spark", "hadoop", "kafka", "airflow", "dbt", "prefect",
        "talend", "informatica", "snowflake", "databricks", "bigquery",
        "redshift", "synapse", "etl", "elt", "data warehouse", "data lake"
    },
    "monitoring_observability": {
        "prometheus", "grafana", "elk", "elasticsearch", "logstash", "kibana",
        "splunk", "datadog", "new relic", "appdynamics", "sentry", "cloudwatch",
        "jaeger", "zipkin", "opentracing", "opentelemetry"
    },
    "project_management": {
        "jira", "confluence", "trello", "asana", "monday.com", "notion",
        "slack", "microsoft teams", "zoom", "basecamp", "clickup"
    },
    "security": {
        "oauth", "jwt", "ssl/tls", "https", "authentication", "authorization",
        "penetration testing", "owasp", "security audit", "hipaa", "gdpr",
        "pci dss", "encryption", "firewall", "vpn", "zero trust"
    }
}

# Common role/position titles
POSITION_TITLES = {
    "frontend": ["frontend", "front-end", "client side", "ui developer"],
    "backend": ["backend", "back-end", "server side", "api developer"],
    "fullstack": ["fullstack", "full stack", "full-stack", "end-to-end"],
    "mobile": ["mobile", "ios", "android", "react native", "flutter"],
    "data": ["data scientist", "data engineer", "data analyst", "ml engineer", "machine learning"],
    "devops": ["devops", "sre", "site reliability", "infrastructure"],
    "qa": ["qa", "quality assurance", "test engineer", "testing"],
    "management": ["tech lead", "engineering manager", "cto", "vp of engineering", "software architect"]
}


class SkillExtractor:
    """Advanced skill extraction using NLP and pattern matching"""

    def __init__(self):
        self.nlp = None
        self._load_spacy_model()

    def _load_spacy_model(self):
        """Load spaCy model if available"""
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                # Model not downloaded, try to load a different model
                try:
                    self.nlp = spacy.load("en_core_web_md")
                except OSError:
                    # No model available, will use rule-based extraction
                    self.nlp = None

    def extract_skills(
        self,
        text: str,
        include_categories: bool = True
    ) -> Dict[str, any]:
        """
        Extract skills from text with optional categorization.

        Args:
            text: Text to extract skills from
            include_categories: Whether to categorize skills

        Returns:
            Dictionary with extracted skills and metadata
        """
        if not text:
            return {
                "skills": [],
                "categories": {},
                "confidence_scores": {},
                "total_count": 0
            }

        text_lower = text.lower()

        # Extract skills using multiple methods
        extracted = {
            "exact_matches": set(),
            "partial_matches": set(),
            "acronyms": set(),
            "compound_terms": set()
        }

        # Method 1: Exact matching with skill taxonomy
        for category, skills in SKILL_TAXONOMY.items():
            for skill in skills:
                skill_lower = skill.lower()
                # Exact word boundary match
                pattern = r'\b' + re.escape(skill_lower) + r'\b'
                if re.search(pattern, text_lower):
                    if include_categories:
                        if category not in extracted:
                            extracted[category] = set()
                        extracted[category].add(skill)
                    extracted["exact_matches"].add(skill)

        # Method 2: Pattern-based extraction for common formats
        extracted["acronyms"].update(self._extract_acronyms(text))
        extracted["compound_terms"].update(self._extract_compound_terms(text))

        # Method 3: spaCy NER if available
        if self.nlp:
            nlp_results = self._extract_with_spacy(text)
            extracted["nlp_entities"] = nlp_results

        # Compile final results
        all_skills = set()
        for skill_set in extracted.values():
            if isinstance(skill_set, set):
                all_skills.update(skill_set)

        # Remove category keys from final skills
        categories_to_remove = set(SKILL_TAXONOMY.keys())
        final_skills = [s for s in all_skills if s.lower() not in categories_to_remove]

        # Calculate confidence scores
        confidence_scores = self._calculate_confidence(extracted, text_lower)

        result = {
            "skills": list(final_skills),
            "total_count": len(final_skills),
            "confidence_scores": confidence_scores
        }

        if include_categories:
            categories = {}
            for category in SKILL_TAXONOMY.keys():
                if category in extracted and extracted[category]:
                    categories[category] = list(extracted[category])
            result["categories"] = categories

        return result

    def _extract_acronyms(self, text: str) -> Set[str]:
        """Extract common tech acronyms (e.g., API, REST, JSON)"""
        acronym_patterns = [
            r'\b[A-Z]{2,5}\b',  # 2-5 capital letters
        ]

        acronyms = set()
        common_acronyms = {
            "API", "REST", "JSON", "XML", "HTML", "CSS", "SQL", "UI", "UX",
            "AWS", "GCP", "Azure", "CI", "CD", "TDD", "BDD", "CRM", "ERP",
            "SaaS", "PaaS", "IaaS", "MVP", "OKR", "KPI", "ROI", "SLA",
            "HTTP", "HTTPS", "FTP", "SSH", "TCP", "UDP", "IP", "DNS",
            "CPU", "GPU", "RAM", "SSD", "HDD", "OS", "IDE", "SDK"
        }

        for pattern in acronym_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if match in common_acronyms:
                    acronyms.add(match)

        return acronyms

    def _extract_compound_terms(self, text: str) -> Set[str]:
        """Extract compound technical terms (e.g., "Machine Learning")"""
        compound_patterns = [
            r'\b(?:machine|deep) learning\b',
            r'\bnatural language processing\b',
            r'\bcomputer vision\b',
            r'\bdata science\b',
            r'\bbig data\b',
            r'\bcloud computing\b',
            r'\bsoftware development\b',
            r'\bweb development\b',
            r'\bmobil(e)? development\b',
            r'\btest(ing)? automation\b',
            r'\bcontinuous (integration|deployment)\b',
            r'\bversion control\b',
            r'\bdatabase management\b',
            r'\bsystem administration\b',
            r'\bnetwork(ing)? security\b'
        ]

        compound_terms = set()
        for pattern in compound_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            compound_terms.update(matches)

        return compound_terms

    def _extract_with_spacy(self, text: str) -> List[Dict]:
        """Extract entities using spaCy NER"""
        if not self.nlp:
            return []

        doc = self.nlp(text)
        entities = []

        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "PERSON"]:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char
                })

        return entities

    def _calculate_confidence(
        self,
        extracted: Dict[str, Set],
        text_lower: str
    ) -> Dict[str, float]:
        """Calculate confidence scores for extracted skills"""
        scores = {}

        for skill in extracted["exact_matches"]:
            skill_lower = skill.lower()
            # Count occurrences
            count = len(re.findall(r'\b' + re.escape(skill_lower) + r'\b', text_lower))
            # More occurrences = higher confidence
            scores[skill] = min(1.0, 0.5 + (count * 0.1))

        for skill in extracted["acronyms"]:
            if skill not in scores:
                scores[skill] = 0.6

        for skill in extracted["compound_terms"]:
            if skill not in scores:
                scores[skill] = 0.7

        return scores

    def detect_position_type(self, text: str) -> List[str]:
        """Detect the type of position from job description"""
        detected = []
        text_lower = text.lower()

        for position_type, keywords in POSITION_TITLES.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    detected.append(position_type)
                    break

        return detected

    def extract_experience_level(self, text: str) -> Optional[str]:
        """Extract experience level requirements"""
        text_lower = text.lower()

        levels = {
            "entry": ["entry level", "junior", "0-1 year", "<1 year", "intern", "trainee"],
            "mid": ["mid level", "mid-senior", "2-5 years", "3+ years", "intermediate"],
            "senior": ["senior", "5+ years", "7+ years", "lead", "principal"],
            "executive": ["director", "vp", "head of", "chief", "cto", "cio"]
        }

        for level, keywords in levels.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return level

        return None

    def calculate_skill_match_score(
        self,
        resume_skills: List[str],
        job_requirements: List[str]
    ) -> Dict[str, any]:
        """
        Calculate how well a resume's skills match job requirements.

        Returns:
            Dictionary with match score and detailed analysis
        """
        if not resume_skills or not job_requirements:
            return {
                "score": 0,
                "matched": [],
                "missing": [],
                "partial_matches": []
            }

        resume_lower = [s.lower() for s in resume_skills]
        job_lower = [s.lower() for s in job_requirements]

        matched = []
        missing = []
        partial_matches = []

        for job_skill in job_requirements:
            job_skill_lower = job_skill.lower()

            # Exact match
            if job_skill_lower in resume_lower:
                matched.append(job_skill)
                continue

            # Partial/fuzzy match
            found_partial = False
            for resume_skill in resume_skills:
                # Check if one contains the other
                if job_skill_lower in resume_skill or resume_skill in job_skill_lower:
                    partial_matches.append({
                        "required": job_skill,
                        "found": resume_skills[resume_lower.index(resume_skill)]
                    })
                    found_partial = True
                    break

            if not found_partial:
                missing.append(job_skill)

        # Calculate score
        total_requirements = len(job_requirements)
        base_score = (len(matched) / total_requirements * 100) if total_requirements > 0 else 0

        # Add partial matches at 50% value
        partial_score = (len(partial_matches) / total_requirements * 50) if total_requirements > 0 else 0

        final_score = min(100, int(base_score + partial_score))

        return {
            "score": final_score,
            "matched": matched,
            "missing": missing,
            "partial_matches": partial_matches,
            "match_percentage": (len(matched) / total_requirements * 100) if total_requirements > 0 else 0
        }


def get_skill_extractor() -> SkillExtractor:
    """Factory function to get a SkillExtractor instance"""
    return SkillExtractor()
