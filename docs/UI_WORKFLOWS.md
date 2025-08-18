# mgmt-boost — UI Workflows & Interaction Specs

This document defines user-facing workflows for mgmt-boost. It focuses on Slack-first interactions, minimal web, and Google Drive for notes. Copy is intentionally concise and neutral.

---

## 0) Principles

- Slack-first: all critical actions available via commands, modals, and DMs.
- Single-click paths: default choices and sensible presets.
- Private by default: clear privacy copy in context.
- Low-friction: keep forms short; prefer optional fields.
- Accessible: keyboard-friendly, concise labels, visible focus states.

---

## 1) Onboarding Flow

### 1.1 Entry points
- Landing page → “Add to Slack”
- Direct Slack install link
- Invited by a colleague (later phase)

### 1.2 Steps
1) OAuth: Slack permissions page (commands, chat:write).  
2) Post-install DM from bot:  
   - Message:  
     - Title: Welcome to mgmt-boost  
     - Body: “Private by default. Notes live in your Google Drive. No raw Slack/Zoom/Jira content is stored.”  
     - Buttons:  
       - Connect Google Drive (primary)  
       - Skip for now (secondary)
3) Google OAuth (scoped to a single folder mgmt-boost creates).  
4) Success DM:  
   - “Connected. Your private folder ‘mgmt-boost Manager Diary’ is set up.”  
   - Quick start buttons:  
     - Try /boost  
     - Create today’s diary  
     - Create 1:1 note

Edge case: if Drive connect is skipped, diary-related commands open a modal first and then prompt to connect before creating documents.

---

## 2) Commands Overview

- `/boost [optional text]` → opens booster modal.
- `/diary` → opens diary modal with type selector.
- `/nav [query]` → opens quick navigator (recent docs by type/person/date).
- `/prefs` → opens preferences modal (quiet hours, nudge limit, timezone).

---

## 3) Message Booster

### 3.1 Trigger patterns
- User selects text and types `/boost`.
- User types `/boost` with inline text: `/boost Fix this by EOD.`

### 3.2 Modal layout
- Title: Message Booster
- Sections:
  - Textarea “Your draft” (prefilled if provided).
  - Info row: “Private. This text is not stored.”
  - Scores row: Clarity (0–100), Tone (negative to supportive), Read time (optional).
  - “Boosted version” preview (non-editable block).
- Actions:
  - Keep original (secondary)  
  - Copy boosted (secondary)  
  - Replace & send (primary)

### 3.3 Copy examples
- Info: “We do not store your draft. Output is provided for your review only.”
- Boosted example: “I noticed an issue in the report. Can you adjust it before end of day? Thanks.”

### 3.4 Error states
- LLM unavailable: “Booster is temporarily unavailable. You can try again or send your original message.”
- Empty draft: disable primary button.

---

## 4) Diary & Notes

### 4.1 Modal: Choose note type
- Title: New diary entry
- Fields:
  - Type (required): Daily log, 1:1, Meeting, Retro
  - Person (conditional, required for 1:1): user picker or free text
  - Title (optional, default based on taxonomy)
  - Date (defaults to today)
  - Quick prompts (checkboxes): include template sections
- Actions:
  - Create in Google Drive (primary)
  - Cancel (secondary)

### 4.2 After submit
- Bot DM: “Document created” with link button “Open in Google Docs” and path display.  
- Secondary buttons:
  - Add a quick note (inline, saves to the doc’s top section)
  - Create another

### 4.3 Inline quick note (optional)
- Small modal:
  - Field: Note (multiline)
  - Action: Append to doc (primary)
- Confirmation DM: “Note appended.”

### 4.4 Taxonomy enforcement
- Daily: `YYYY-MM-DD_Daily_Log`
- 1:1: `YYYY-MM-DD_1-1_{Person}`
- Meeting: `YYYY-MM-DD_{Type}`
- Retro: `YYYY-MM-DD_Retro`

Edge cases:
- Duplicate doc for same type/date/person → return existing doc and state “Found existing. Reusing.”
- Drive not connected → interstitial modal “Connect Google Drive to continue.”

---

## 5) Navigator

### 5.1 `/nav`
- Input: free text (e.g., “Sarah”, “retro”, “today”)
- Result view (modal list):
  - Tabs: Recent, 1:1s, Meetings, Daily
  - Rows: Title, Date, Person (if any), Open button
- Empty state: “No matches. Try /diary to create a note.”

---

## 6) Weekly Digest

### 6.1 Delivery
- Email and Slack DM (summary with button “Open email” or “View summary”)
- Sent on Monday morning local time by default

### 6.2 Content blocks
- Team pulse: “Energy steady; collaboration dipped after retro conflict.”
- Recognition: “Two milestone commits went unrecognized.”
- 1:1 themes: “Sarah progressing; low team connection (3 weeks).”
- Suggested actions: three bullets, each with a “Create note” or “Draft message” quick button.

### 6.3 Slack DM summary
- Title: Weekly Compass Digest
- Bullets: 3–5 lines max
- Buttons:
  - Draft recognition message
  - Open navigator
  - Adjust cadence

---

## 7) Nudges

### 7.1 Triggers (examples)
- Quiet team: channel activity below 7-day baseline
- Missed recognition: release detected with no shout-out after 48 hours
- 1:1 cadence: gap exceeds user-configured threshold
- Retro follow-up: unresolved items from last retro

### 7.2 DM format
- Title: “Suggestion”
- Body: one sentence with context
- Buttons: Act now, Snooze, Dismiss
- Footer: “Private to you. You can adjust nudge frequency in /prefs.”

### 7.3 Throttling
- Max 2 nudges per day
- Respect quiet hours (user timezone)

---

## 8) Preferences

### 8.1 `/prefs` modal
- Quiet hours (time range, local timezone prefilled)
- Nudge limit (0–2 per day)
- Weekly digest day/time
- Data retention preference (30/60/90 days) for derived signals
- Save (primary), Cancel (secondary)

---

## 9) Privacy Notices

- Booster modal: “We do not store your draft.”
- Diary success DM: “Document lives in your Google Drive. Only file metadata is indexed.”
- Digest footer: “All signals are derived and anonymized. Raw Slack/Zoom content is not stored.”
- Settings link to privacy page on GitHub Pages.

---

## 10) Empty and Error States

- No Drive connection: Interstitial “Connect Google Drive to continue.”
- No recent docs in `/nav`: Prompt to create with `/diary`.
- LLM down: Gracefully degrade booster with copy tips or retry later.
- API rate limit from Drive/Slack: Inform user and retry automatically with backoff; show “Working on it, will DM you the link shortly.”

---

## 11) Copy Kit

Short, neutral language. Avoid jargon.

- Booster call-to-action: “Replace and send”
- Booster info: “Private. Draft text is not stored.”
- Diary creation confirmation: “Document created in your Drive”
- Nudge action: “Act now” / “Snooze” / “Dismiss”
- Digest subject line: “Your weekly compass”
- Empty state in navigator: “No matches. Try creating a note with /diary.”

---

## 12) Accessibility

- All modals support keyboard navigation.
- Labels tied to inputs explicitly.
- Minimum 4.5:1 contrast for text.
- Focus rings visible on actionable elements.
- Avoid relying on color alone for scores; include labels.

---

## 13) Analytics (privacy-safe)

Track counts only; never store content.

- Boost usage count and success/failure
- Diary creation count per type
- Navigator opens and clicks
- Nudge accept/snooze/dismiss rates
- Digest open clicks (Slack button presses)

---

## 14) QA Checklist

- Booster modal: open, scores render, disabled state with empty draft
- Diary modal: 1:1 requires person; duplicate doc handling
- Navigator: search by person, type, date keywords
- Nudges: throttle respected, quiet hours respected
- Preferences: saved and reflected in behavior
- Privacy copy present in all relevant surfaces

---

## 15) Future Enhancements (UI)

- Inline edit of boosted text inside the modal (optional field)
- Smart suggestions in diary modal based on past entries
- Meeting auto-capture: after Zoom call, offer to create a Meeting note
- Web digest viewer with links back to Drive and Slack commands

---
