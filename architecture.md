# GharDisha AI Architecture — Strict Live API Version

```text
Rural family / trusted helper
        ↓
Guided React + Vite UI
  - language, role, story input
  - optional document/photo upload
  - client guardrails for greetings, jailbreaks, and fake-proof requests
        ↓
Speechmatics voice transcription token (optional)
        ↓
FastAPI backend
  - /api/health
  - /api/analyze
  - /api/analyze-with-file
  - /api/speechmatics-token
        ↓
Server-side validation and safety checks
        ↓
Document extraction
  - image → live AI/ML vision interpretation
  - text PDF/TXT → text extraction
  - scanned PDF → user should upload clear image/screenshot
        ↓
PMAY-G RAG source retrieval
  - curated PMAY-G knowledge base
  - human-in-the-loop policy boundary
  - temporary shelter / verification safeguards
        ↓
Live AI/ML API reasoning
  - structured case facts
  - missing proof gaps
  - targeted follow-up question
  - 48-hour action plan
  - BDO / Gram Panchayat questions
        ↓
Deterministic safety verifier
  - no eligibility approval
  - no guaranteed benefits
  - no fake-document generation
  - no bypassing officials
        ↓
BDO-ready summary + readiness score + source cards
        ↓
Gram Panchayat / Gram Sabha / BDO official verification
```

## No mock mode

The previous `mock_safe_demo_mode` has been removed. `/api/analyze` and `/api/analyze-with-file` require `AIMLAPI_KEY` for live AI reasoning. Voice remains optional because the user can still type if `SPEECHMATICS_API_KEY` is not configured.

## Why the PMAY-G JSON still exists

A RAG system needs a trusted source base. The PMAY-G JSON file is not a fake output file; it is the curated source-grounding layer. The retriever selects relevant snippets for each case so the AI stays focused on PMAY-G preparation instead of inventing unsupported policy claims.

## Responsible AI boundary

GharDisha AI never approves housing, guarantees eligibility, or replaces officials. It prepares the family or trusted helper for Gram Panchayat / Gram Sabha / BDO verification. Final administrative decisions remain with official government processes.

## Readiness score boundary

The BDO visit readiness score is a preparation score only. It measures whether the family has enough facts, proof, and questions for an official visit. It is not an eligibility score and should never be presented as approval.