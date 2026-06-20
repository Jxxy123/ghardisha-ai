# GharDisha AI Architecture — Strict Live API Version

```text
User/helper story + optional document
        ↓
Speechmatics voice transcription (optional)
        ↓
FastAPI backend
        ↓
Document extraction
  - image → live AI/ML vision
  - text PDF/TXT → text extraction
        ↓
Live AI/ML API: case fact extraction
        ↓
PMAY-G source snippet retrieval
        ↓
Live AI/ML API: source-grounded action-plan generation
        ↓
Deterministic safety verifier
        ↓
BDO-ready summary + source cards
```

## No mock mode

The previous `mock_safe_demo_mode` has been removed. `/api/analyze` and `/api/analyze-with-file` require `AIMLAPI_KEY`.

## Why the PMAY-G JSON still exists

A RAG system needs a trusted source base. The JSON file is not a fake output file; it is the source grounding layer. The AI uses it dynamically based on each case.

## Responsible AI boundary

GharDisha AI never approves housing. It prepares the user for official Gram Sabha/BDO verification.
