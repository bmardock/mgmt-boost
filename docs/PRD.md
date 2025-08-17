# mgmt-boost – Product Requirements Document (PRD)

## 1. Overview
**Problem:** Managers are under constant pressure to balance execution and empathy. Stress, politics, and time crunches can lead to poor communication, overlooked morale, and missed recognition.  

**Solution:** mgmt-boost is a Slack-first toolkit that augments managers with real-time communication feedback, team health insights, and lightweight coaching prompts—without introducing yet another tool.  

**Vision:** Every manager has the "superpowers" of clarity, empathy, recognition, and cadence built into their daily workflow.  

---

## 2. Goals
- Improve **manager communication quality** (less misinterpretation, more clarity/empathy).  
- Provide **lightweight team health signals** (morale, participation, cadence).  
- Encourage **recognition and feedback loops**.  
- Enable managers to **organize their own notes** (1:1s, reflections, retros) with minimal friction.  
- Deliver value in Slack (and optionally Google Drive), keeping the tool invisible but powerful.  

---

## 3. Non-Goals
- Not a full HR platform or performance review system.  
- Not a replacement for project tracking tools (Jira, GitHub).  
- Not intended to give executives visibility into raw manager/team notes (privacy-first).  

---

## 4. User Personas
- **Primary:** Middle Managers (team leads, engineering managers, product managers).  
- **Secondary:** First-time managers seeking guidance.  
- **Future:** Org-level sponsors (HR, VP Eng, People Ops) interested in adoption.  

---

## 5. Key Features
1. **Message Booster**  
   - Pre-send Slack draft analysis.  
   - Scores tone and clarity, suggests improvements.  

2. **Diary & Notes**  
   - `/diary` command opens structured note entry (free-form or prompted).  
   - Saved to Google Drive with consistent taxonomy (e.g., `/team/john_doe/1-1_notes/`).  
   - Notes can be tagged with meeting type (retro, 1:1, standup).  

3. **Team Pulse Tracker**  
   - Passive signals: channel activity, participation, sentiment in messages.  
   - Active signals: diary entries, quick feedback check-ins.  
   - Nudges when the team is unusually quiet, after major releases, or when recognition is due.  

4. **Recognition Nudges**  
   - Detect milestones (big releases, sprint completions).  
   - Remind manager to celebrate or acknowledge.  

5. **Cadence Coach**  
   - Track frequency of 1:1s and meetings.  
   - Suggest adjustments when cadence slips or morale dips.  

6. **Meeting Reflections**  
   - After retros, 1:1s, or team calls, provide structured prompts:  
     - What went well?  
     - What could be improved?  
     - What follow-ups are needed?  

7. **Weekly Digest**  
   - Short email summarizing: team sentiment, note highlights, nudges for next week.  

---

## 6. Success Metrics
- Managers report **improved confidence** in communication (survey).  
- Increased **frequency of recognition events** (tracked via nudges).  
- Reduction in **missed 1:1s / skipped cadences**.  
- Positive delta in **team morale signals** over time.  

---

## 7. System Design (High-Level)
- **Frontend**: Slack app (slash commands, message actions), lightweight web for Drive note browsing.  
- **Backend**: API server for message analysis, sentiment, scheduling nudges.  
- **Integrations**:  
  - Slack (primary)  
  - Google Drive (notes storage)  
  - Optional: Zoom, Jira, GitHub for signals  
- **Storage**: Minimal — user data lives in Google Drive; backend stores metadata only (tokens, IDs).  
- **Security**: Ephemeral processing, anonymized aggregation, manager-owned data.  

---

## 8. Roadmap
- **MVP (3 months):** Slack `/boost` + `/diary`, Google Drive sync, weekly digest.  
- **Phase 2 (6 months):** Zoom/Jira/GitHub integrations, recognition nudges, morale radar.  
- **Phase 3 (12 months):** Manager Compass dashboard, delegation detector, onboarding companion, enterprise features.  

---

## 9. Risks
- **Privacy concerns** → must lead with “manager owns the data.”  
- **Adoption friction** → must feel invisible; Slack-first is key.  
- **Over-coaching fatigue** → nudges should be rare and meaningful.  

---

## 10. Appendices
- **Example Slack commands**  
  - `/boost Draft message here`  
  - `/diary 1:1 with Sarah`  

- **Example note structure in Drive**  
  - `/mgmt-boost/2025-08-17/1-1_sarah.md`  
  - `/mgmt-boost/2025-08-17/retro_notes.md`  
