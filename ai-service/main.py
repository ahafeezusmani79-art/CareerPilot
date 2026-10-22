
import re
from collections import Counter

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="CareerPilot AI Service",
    description="Free offline resume analysis service",
    version="1.1.0",
)


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=50, max_length=15000)
    job_description: str = Field(default="", max_length=10000)


STOP_WORDS = {
    "the", "and", "for", "with", "that", "this", "you",
    "your", "are", "our", "from", "have", "has", "was",
    "were", "will", "would", "should", "can", "who",
    "what", "when", "where", "how", "not", "but", "all",
    "any", "their", "they", "them", "his", "her", "its",
    "into", "about", "over", "under", "using", "use",
    "used", "required", "requirements", "preferred",
    "ability", "work", "working", "role", "job", "skills",
    "skill", "experience", "years", "strong", "good",
    "knowledge", "including", "such", "other", "more",
    "some", "also", "must", "should", "been", "being",
    "able", "based", "within", "across", "each", "both",
    "through", "various", "responsibilities",
}

SECTION_PATTERNS = {
    "Contact information": r"\b(email|phone|contact|linkedin|github)\b",
    "Education": r"\b(education|university|college|degree|bachelor|master|diploma)\b",
    "Skills": r"\b(skills|technologies|technical skills|tools)\b",
    "Projects": r"\b(projects|project experience|portfolio)\b",
    "Experience": r"\b(experience|employment|work history|internship)\b",
}


def words(text):
    return re.findall(r"[a-zA-Z][a-zA-Z+#.]*", text.lower())


@app.get("/")
def home():
    return {"message": "CareerPilot AI Service is running!"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "careerpilot-ai",
        "mode": "offline",
    }


@app.post("/analyze")
def analyze_resume(request: ResumeAnalysisRequest):
    resume = request.resume_text.strip()
    resume_lower = resume.lower()
    job = request.job_description.strip().lower()

    sections_found = [
        section
        for section, pattern in SECTION_PATTERNS.items()
        if re.search(pattern, resume_lower)
    ]

    improvements = []

    missing_sections = [
        section
        for section in ["Education", "Skills", "Projects", "Experience"]
        if section not in sections_found
    ]

    if missing_sections:
        improvements.append(
            "Consider adding clearly labelled sections where relevant: "
            + ", ".join(missing_sections)
            + "."
        )

    if len(resume.split()) < 100:
        improvements.append(
            "Your resume is quite short. Add relevant project details, "
            "responsibilities, and concrete achievements where applicable."
        )

    if not re.search(r"\b(action|built|created|developed|designed|"
                     r"implemented|improved|managed|tested|led|"
                     r"delivered|automated|analyzed)\b", resume_lower):
        improvements.append(
            "Start project and experience bullet points with clear "
            "action verbs that accurately describe your work."
        )

    if not re.search(r"\b\d+%|\b\d+\+?\s*(users|clients|projects|"
                     r"hours|months|years)\b", resume_lower):
        improvements.append(
            "Where you have evidence, include measurable results "
            "such as project counts, performance improvements, "
            "or numbers of users."
        )

    if not re.search(r"@|linkedin\.com|github\.com", resume_lower):
        improvements.append(
            "Consider adding professional contact details and "
            "relevant portfolio links."
        )

    if not improvements:
        improvements.append(
            "Review formatting, spelling, consistency, and whether "
            "each bullet demonstrates a relevant result."
        )

    strengths = []

    if "Education" in sections_found:
        strengths.append("Education information appears to be included.")

    if "Skills" in sections_found:
        strengths.append("A skills section appears to be included.")

    if "Projects" in sections_found:
        strengths.append("A projects section appears to be included.")

    if "Experience" in sections_found:
        strengths.append("An experience section appears to be included.")

    if re.search(r"\b(built|created|developed|implemented|designed)\b",
                 resume_lower):
        strengths.append(
            "The resume includes action-oriented language."
        )

    if re.search(r"\b\d+%|\b\d+\+?\s*(users|clients|projects|"
                 r"hours|months|years)\b", resume_lower):
        strengths.append(
            "The resume includes measurable details that may help "
            "communicate impact."
        )

    if not strengths:
        strengths.append(
            "The resume text has been provided for review. "
            "Use clear sections and specific, relevant examples."
        )

    missing_keywords = []

    if job:
        job_words = [
            word for word in words(job)
            if word not in STOP_WORDS and len(word) > 2
        ]

        resume_words = set(words(resume))
        counts = Counter(job_words)

        # Only report meaningful terms absent from the resume.
        for keyword, _ in counts.most_common():
            if keyword not in resume_words and keyword not in missing_keywords:
                missing_keywords.append(keyword)

            if len(missing_keywords) >= 15:
                break

    rewritten_bullet_points = []
    bullets = [
        line.strip(" \t-*•")
        for line in request.resume_text.splitlines()
        if line.strip(" \t-*•")
    ]

    action_words = (
        "built", "created", "developed", "designed",
        "implemented", "managed", "improved", "tested",
    )

    for bullet in bullets:
        if (
            len(bullet.split()) >= 5
            and any(
                action in bullet.lower()
                for action in action_words
            )
        ):
            rewritten_bullet_points.append({
                "original": bullet,
                "suggestion": (
                    "Clarify the purpose, your specific contribution, "
                    "and the result. Add measurable outcomes only "
                    "when you can verify them."
                ),
            })

        if len(rewritten_bullet_points) >= 3:
            break

    score = min(100, max(0, 40 + len(sections_found) * 10))
    score += 5 if len(resume.split()) >= 100 else 0
    score += 5 if re.search(
        r"\b(built|created|developed|implemented|designed)\b",
        resume_lower,
    ) else 0
    score = min(score, 100)

    if job:
        overall_summary = (
            "This is a rule-based resume review. "
            "The keyword list highlights terms found in the job "
            "description but not detected in your resume. "
            "Check each term for relevance before adding it."
        )
    else:
        overall_summary = (
            "This is a rule-based resume review based on detected "
            "sections, length, action-oriented language, and measurable "
            "details. It is guidance, not a prediction of hiring success."
        )

    return {
        "overall_summary": overall_summary,
        "score": score,
        "strengths": strengths,
        "improvements": improvements,
        "missing_keywords": missing_keywords,
        "rewritten_bullet_points": rewritten_bullet_points,
        "analysis_mode": "offline_rule_based",
    }
