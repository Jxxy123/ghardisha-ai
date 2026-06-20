# GharDisha AI — Fixes Applied to the Backend (review pass)

Your backend was strong. These are the concrete bugs/issues fixed and verified.

## Bugs fixed (these would have caused real failures)

1. **Human-in-the-loop snippet was being silently dropped** (`kb.py`).
   The retrieval appended the responsible-AI boundary snippet *after* slicing to
   top_k, then sliced again — so it got cut whenever 5 other snippets matched.
   Your Responsible AI scoring point was missing from output. Now a slot is
   reserved so it is always included. Verified.

2. **Knowledge base still said "ClimaDoc," not "GharDisha AI"** (`pmayg_knowledge_base.json`).
   The project name and the human-in-loop snippet text referenced the old name,
   which the AI reads and can echo, and which is visible at /api/kb. Renamed
   everywhere. Verified 0 remaining references.

3. **Greedy JSON regex could mismatch braces on nested output** (`reasoning.py`).
   The fallback `re.search(r"\{.*\}")` is unsafe for deeply nested JSON. Replaced
   with a balanced-brace scanner that also strips ```json fences. Verified on
   fenced and wrapped samples.

## Language feature made real (not fake)

You chose: force Hindi + English + Assamese output.

- The action-plan prompt now **forces** the model to write all user-facing text
  in the selected language (`language_instruction()` in `reasoning.py`).
- The safety verifier's fallback rewrite is now **language-aware** — it no longer
  injects English status/human-in-loop text into a Hindi or Assamese plan
  (localized fallback strings added). Verified Hindi + Assamese fallbacks render.
- **Voice input** language now follows the dropdown for Speechmatics-supported
  languages. IMPORTANT: Speechmatics does **not** support Assamese transcription.
  So if the user picks Assamese, voice input transcribes in **Hindi** (widely
  spoken in rural Assam) while the **written output** is still Assamese.
- The frontend dropdown now labels this honestly:
  "English (voice + text)", "Hindi (voice + text)", "Assamese (text output)",
  with a note: "Voice input supports Hindi & English. Written output in all three."

## Frontend cleanups

- Added missing `vite.config.js` (frontend would not start without it).
- Removed unused `@speechmatics/browser-audio-input` dependency (the hook uses
  manual Web Audio capture, not that package).
- Added `.env`, `.env.example`, `.gitignore`.

## Honest positioning for judges

- Voice input: Hindi & English (real, Speechmatics-supported).
- Written output: Hindi, English, Assamese (real, LLM-generated).
- "Assamese voice input and more regional languages" = roadmap.
  This is true and defensible — don't claim Assamese voice works.

## One reminder

Assamese LLM output quality is decent in modern models but weaker than Hindi.
Test a few Assamese runs before recording. If quality is poor on the day,
demo in Hindi (your hero's region speaks it) and keep Assamese as shown-but-roadmap.

---

## Prompt-quality upgrade (after first live test)

The first live Hindi run worked and was not hallucinating, but the action plan
was thin (2 steps). Strengthened the action-plan prompt in reasoning.py:

1. **Richer 48-hour plan** — now asks for 4-6 concrete, case-tailored steps
   (keep Aadhaar/ration ready, request flood/damage certificate, ask Panchayat
   about Awaas+/SECC listing, ask about fresh Awaas+ 2024 survey, ask what proof
   is accepted if land papers lost, prepare bank/Aadhaar linkage).
2. **Sharper biggest_obstacle** — now combines disaster/damage proof + Awaas+/SECC
   listing + land/site verification, not just "land papers".
3. **Displacement-focused next question** — prioritises asking about flood/damage
   proof or a Gram Panchayat letter over generic identity questions.
4. **Graceful not-a-fit path** (from mentor feedback) — if the family likely does
   NOT fit PMAY-G, the AI explains which criterion is unmet, tells them to verify
   against official criteria, and points them to a human official for alternatives
   — instead of forcing "may qualify" or bluntly saying "not eligible". It will
   NOT invent other scheme details (anti-hallucination).

No schema change. Frontend and safety verifier untouched. Same fields, better content.

---

## Full UI translation + trust intro (accessibility pass)

The AI content was translating, but the interface labels stayed English — a
half-English screen breaks trust for a Hindi/Assamese-only rural user.

Fixed:
1. **New `frontend/src/translations.js`** — every UI label (headings, buttons,
   field labels, journey steps, result sections, footer) in English, Hindi, and
   Assamese. `tr(language, key)` falls back to English if a key is missing.
2. **`main.jsx` fully rewired** — all hardcoded English strings replaced with
   `t('key')`. Selecting Hindi or Assamese now translates the ENTIRE page, not
   just the AI output.
3. **New "How this helps you" trust intro** (guide-card) — a short, plain-language,
   localized block: free tool, tell us what happened, we explain what PMAY-G help
   you may ask for and what papers to bring, we don't decide (the officer does),
   this is not a government website. Directly answers the mentor's trust question.

Notes:
- English + Hindi labels are reviewed; Assamese is best-effort and may be refined.
- Voice input still Hindi/English only (Speechmatics limit); written output + UI
  labels cover all three.
- Backend untouched.
