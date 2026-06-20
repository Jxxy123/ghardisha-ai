# Setup Guide — GharDisha AI Strict Live Mode

## Required installs

- Cursor or VS Code
- Node.js LTS
- Python 3.11+
- Git optional

Google Cloud Console is **not required** for this MVP.

## Required API keys

- AI/ML API key: required for all reasoning and image-document extraction.
- Speechmatics API key: optional for voice; typing still works without it.

## Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Set `.env` values before running the final demo.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## File upload notes

- JPG/PNG/WEBP: sent to AI/ML vision model.
- PDF: text PDFs are extracted locally, then interpreted by AI.
- Scanned PDF: upload a clear JPG/PNG screenshot instead.

## Final demo warning

This strict version intentionally fails if the AI API key is missing or the live AI call fails. That matches your request for no mock mode. For a hackathon, record the demo after you have tested the exact internet/API setup.
