"""
GharDisha AI — Live Document Processing
=======================================
Supports optional uploaded evidence/rejection-document input.

- Images (jpg/png/webp): sent to the configured AI/ML vision model in real time.
- PDFs: extract embedded text locally with pypdf, then the main AI reasoning call interprets it.
- Text files: decoded directly.

No mock OCR output is generated. If extraction fails, the API returns a clear error.
"""

from __future__ import annotations

import base64
import os
from typing import Any

import httpx
from fastapi import HTTPException, UploadFile
from pypdf import PdfReader

VISION_SYSTEM_PROMPT = """
You are a document text extraction assistant for a PMAY-G navigation prototype.
Read the uploaded document image and extract visible text plus a short document-type guess.
Do not invent missing text. Return JSON only.
""".strip()


def _config() -> tuple[str, str, str]:
    api_key = os.getenv("AIMLAPI_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="AIMLAPI_KEY is missing. Document AI requires live AI/ML API access.")
    base_url = os.getenv("AIMLAPI_BASE_URL", "https://api.aimlapi.com/v1").rstrip("/")
    model = os.getenv("AIMLAPI_VISION_MODEL", os.getenv("AIMLAPI_MODEL", "gpt-4o-mini"))
    return api_key, base_url, model


async def _vision_extract_image(file: UploadFile, data: bytes) -> str:
    api_key, base_url, model = _config()
    mime = file.content_type or "image/jpeg"
    b64 = base64.b64encode(data).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": VISION_SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Extract all visible text from this document image. Return concise JSON with extracted_text and document_type_guess."},
                                {"type": "image_url", "image_url": {"url": data_url}},
                            ],
                        },
                    ],
                    "temperature": 0,
                    "response_format": {"type": "json_object"},
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            return content
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Vision API error: {e.response.text[:500]}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Document vision extraction failed: {str(e)}")


def _extract_pdf_text(data: bytes) -> str:
    try:
        from io import BytesIO
        reader = PdfReader(BytesIO(data))
        pages = []
        for i, page in enumerate(reader.pages[:5]):
            text = page.extract_text() or ""
            if text.strip():
                pages.append(f"--- Page {i + 1} ---\n{text.strip()}")
        if not pages:
            raise HTTPException(status_code=422, detail="This PDF appears scanned/image-only. Upload a clear JPG/PNG screenshot for live vision extraction.")
        return "\n\n".join(pages)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read PDF text: {str(e)}")


async def extract_document_text(file: UploadFile) -> dict[str, Any]:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File is too large for MVP upload. Please keep it under 8 MB.")

    content_type = (file.content_type or "").lower()
    filename = (file.filename or "uploaded_file").lower()

    if content_type.startswith("image/") or filename.endswith((".jpg", ".jpeg", ".png", ".webp")):
        extracted = await _vision_extract_image(file, data)
        return {"filename": file.filename, "method": "live_ai_vision", "extracted_text": extracted}

    if content_type == "application/pdf" or filename.endswith(".pdf"):
        extracted = _extract_pdf_text(data)
        return {"filename": file.filename, "method": "pdf_text_extraction_then_ai_reasoning", "extracted_text": extracted}

    if content_type.startswith("text/") or filename.endswith((".txt", ".md")):
        return {"filename": file.filename, "method": "text_file", "extracted_text": data.decode("utf-8", errors="replace")}

    raise HTTPException(status_code=415, detail="Unsupported file type. Use JPG, PNG, WEBP, PDF with text, TXT, or MD.")
