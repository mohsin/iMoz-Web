#!/usr/bin/env python3
"""
Quick preview script — generates a passwordless brochure PDF for manual inspection.
Usage: python3 scripts/preview_brochure.py [output_path]
Default output: /tmp/preview_brochure.pdf
"""

import sys
import json
import os
import subprocess
from dotenv import dotenv_values

_env = dotenv_values(os.path.join(os.path.dirname(__file__), '..', '.env'))

OUTPUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/preview_brochure.pdf'

data = {
    "workshop_slug": "ai-development-workshop",
    "workshop_title": "Agentic AI Development with Live Demonstrations",
    "variant_label": "Agentic",
    "version": "1.0",
    "hackathon_name": "Agentathon",
    "topics": [
        {"name": "How LLMs Actually Work", "duration": "25 min"},
        {"name": "Prompt Engineering & Design", "duration": "30 min"},
        {"name": "Working with AI APIs — Gemini, OpenAI & Anthropic", "duration": "30 min"},
        {"name": "Structured Outputs & Function Calling", "duration": "30 min"},
        {"name": "Building Your First Chatbot", "duration": "45 min"},
        {"name": "RAG — Connecting AI to Your Own Data", "duration": "45 min"},
        {"name": "Tool Use & Function Calling in Depth", "duration": "45 min"},
        {"name": "Introduction to LangGraph", "duration": "45 min"},
        {"name": "Building Your First AI Agent", "duration": "1 hour"},
        {"name": "Agentathon — Idea Forming", "duration": "30 min"},
        {"name": "Agentathon — Build", "duration": "1 hour"},
        {"name": "Agentathon — Demo & Review", "duration": "30 min"},
        {"name": "AI Tools for Developers", "duration": "20 min"},
        {"name": "Hallucinations, Safety & Responsible Use", "duration": "20 min"},
        {"name": "Memory, State & Long-Running Workflows", "duration": "45 min"},
        {"name": "Multi-Agent Architectures", "duration": "1 hour"},
        {"name": "Human-in-the-Loop Patterns", "duration": "30 min"},
        {"name": "Evaluating & Debugging Agents", "duration": "30 min"},
        {"name": "Deploying Agents to Production", "duration": "30 min"},
        {"name": "Career in AI", "duration": "15 min"},
    ],
    "institution_name": "Saranathan College of Engineering",
    "institution_department": "Dept. of Computer Science & Engineering",
    "institution_address": "Venkateswara Nagar, Panjappur",
    "institution_city": "Tiruchirappalli",
    "institution_state": "Tamil Nadu",
    "institution_pincode": "620012",
    "proposer_name":    _env.get('PROPOSER_NAME', ''),
    "proposer_email":   _env.get('PROPOSER_EMAIL', ''),
    "proposer_phone":   _env.get('PROPOSER_PHONE', ''),
    "proposer_website": _env.get('PROPOSER_WEBSITE', ''),
    "training_course_desc": "Agentic course on AI Development along with an Agentathon at the end of the course",
    "pricing": {
        "student": 500,
        "professional": 1000,
        "minimum_students": 100,
        "validity_days": 30,
    },
    "all_workshops": [
        {"slug": "web-development-workshop",        "title": "Web Development Workshop"},
        {"slug": "android-development-workshop",    "title": "Android Development Workshop"},
        {"slug": "ios-development-workshop",        "title": "iOS Development Workshop"},
        {"slug": "cross-platform-mobile-workshop",  "title": "Cross-Platform Mobile Workshop"},
        {"slug": "ethical-hacking-workshop",        "title": "Ethical Hacking Workshop"},
        {"slug": "ai-development-workshop",         "title": "AI Development Workshop"},
    ],
    # Empty password → pikepdf will still encrypt, but open without a password prompt
    "password": "",
}

script = os.path.join(os.path.dirname(__file__), "generate_brochure.py")
result = subprocess.run(
    ["python3", script, OUTPUT],
    input=json.dumps(data),
    capture_output=True,
    text=True,
)
if result.returncode != 0:
    print("FAILED:", result.stderr, file=sys.stderr)
    sys.exit(1)

print(f"Preview written to: {OUTPUT}")
# Open immediately in the default PDF viewer
subprocess.Popen(["open", OUTPUT])
