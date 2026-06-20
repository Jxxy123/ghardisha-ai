# GharDisha AI — Strict Live API MVP

AI case interpreter for climate-displaced rural families navigating PMAY-G.

This version is intentionally **strict live mode**:

- No mock case extractor
- No fake/demo result mode
- No sample-story button
- AI reasoning requires `AIMLAPI_KEY`
- Speechmatics voice uses `SPEECHMATICS_API_KEY` when configured
- Optional JPG/PNG/WEBP/PDF/TXT upload is supported

Important: the PMAY-G JSON knowledge base is **not mock output**. It is the verified source-grounding layer used for RAG. The personalized case extraction and action plan are generated in real time through AI/ML API.

## Run backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `backend/.env`:

```env
AIMLAPI_KEY=your_aimlapi_key_here
AIMLAPI_BASE_URL=https://api.aimlapi.com/v1
AIMLAPI_MODEL=gpt-4o-mini
AIMLAPI_VISION_MODEL=gpt-4o-mini
SPEECHMATICS_API_KEY=your_speechmatics_key_here
```

Then run:

```bash
uvicorn app.main:app --reload --port 8000
```

Check:

```text
http://localhost:8000/api/health
http://localhost:8000/docs
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo spine

1. Trusted helper enters Priya’s real story or uses Speechmatics voice.
2. Optional file upload: flood certificate/rejection note/photo/PDF.
3. Backend calls live AI/ML API for case extraction.
4. Backend retrieves PMAY-G source snippets.
5. Backend calls live AI/ML API for BDO-ready action plan.
6. Safety verifier blocks guarantee language.

## What to tell judges

“GharDisha AI does not approve PMAY-G benefits. It interprets messy disaster stories, grounds the answer in verified PMAY-G source snippets, identifies missing proof/listing blockers, and prepares the family for Gram Sabha/BDO verification.”


## Latest prototype upgrade

This version adds a multi-screen trust-building onboarding flow:

1. Animated splash screen with GharDisha AI identity.
2. Language selection for English, Hindi, Assamese, Bengali, and Urdu.
3. Name + role screen so the system can personalize the experience.
4. Guided trust slides explaining what the AI does, what it does not do, official-source grounding, and the human-in-the-loop boundary.
5. Live AI case interpreter screen with optional document upload, source-grounded reasoning, and BDO-ready summary.

Design note: the app uses dignified, symbolic rural-family illustrations instead of exploitative real disaster/homelessness photos.
The primary beneficiary remains the climate-displaced family; the operator can be a trusted helper, NGO worker, Panchayat representative, or relief worker.
