"""
GharDisha AI — Speechmatics Voice Token Layer
================================================
Purpose for judges:
- Voice input lets a low-literacy family member SPEAK their story instead of typing.
- SECURITY: the long-lived Speechmatics API key NEVER reaches the browser.
  Instead, this endpoint mints a short-lived JWT (temporary key) that the
  browser uses to open a real-time transcription WebSocket directly to
  Speechmatics. This is the pattern Speechmatics officially recommends.
- SAFETY: if no SPEECHMATICS_API_KEY is configured, the endpoint reports
  voice as "unavailable" and the UI silently falls back to typing — the
  demo can never crash because voice failed.
"""

from __future__ import annotations

import os

import httpx
from dotenv import load_dotenv

load_dotenv()

# Speechmatics management-plane endpoint that issues temporary realtime keys.
SM_TOKEN_URL = "https://mp.speechmatics.com/v1/api_keys?type=rt"


def voice_enabled() -> bool:
    """True only when a Speechmatics API key is configured."""
    return bool(os.getenv("SPEECHMATICS_API_KEY", "").strip())


async def mint_realtime_token(ttl_seconds: int = 60) -> dict:
    """
    Exchange the secret long-lived API key for a short-lived JWT.

    Returns:
        {"enabled": True, "jwt": "<token>", "ttl": 60} on success
        {"enabled": False, "reason": "..."}              when voice is off/fails
    """
    api_key = os.getenv("SPEECHMATICS_API_KEY", "").strip()
    if not api_key:
        return {"enabled": False, "reason": "Voice input not configured (no API key). Typing is available."}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                SM_TOKEN_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={"ttl": ttl_seconds},
            )
            resp.raise_for_status()
            data = resp.json()
            # Speechmatics returns the temporary key under "key_value".
            jwt = data.get("key_value") or data.get("jwt")
            if not jwt:
                return {"enabled": False, "reason": "Speechmatics did not return a token."}
            return {"enabled": True, "jwt": jwt, "ttl": ttl_seconds}
    except Exception as exc:  # noqa: BLE001 - we fail safe, never crash the demo
        return {"enabled": False, "reason": f"Could not reach Speechmatics: {exc}. Typing is available."}
