# mgmt-boost — System Design

**Purpose**  
Slack-first manager augmentation: message boosters, diary/notes to Google Drive, lightweight team pulse signals, and weekly digest. Privacy-first and minimal surface area.

**Design goals**
- Live in Slack and email; no heavy new UI.
- Store minimal data; user owns notes in Google Drive.
- Ephemeral processing for raw content; persist only derived signals/metadata.
- Simple to run as a small service; extensible to enterprise/VPC.

---

## 1) High-Level Architecture

```
Clients
 ├─ Slack (commands, modals, DMs)
 ├─ Email (weekly digest)
 └─ (Phase 2+) Zoom, Jira, GitHub

Backend
 ├─ API Gateway (HTTPS, auth, routing)
 ├─ Command Handlers (Slack actions, diary, nav, booster)
 ├─ LLM/Tone Service (rephrase/score; stateless)
 ├─ Integrations SDK (Google Drive/Docs, Slack Web API)
 ├─ Workers (queues: signals, digest, schedules)
 └─ Rules Engine (nudge prioritization)

Data
 ├─ Postgres (users, oauth tokens, doc index, signals, nudges)
 └─ Object store: none (notes live in Google Drive)

External
 ├─ Slack API
 └─ Google Drive/Docs API
```

---

## 2) Core Components
- **API Gateway**: verifies Slack signatures, routes requests.  
- **Command Handlers**: `/boost`, `/diary`, `/nav`, `/summary`.  
- **LLM/Tone Service**: rephrasing + scoring, stateless.  
- **Workers**: process signals, build digests, run schedulers.  
- **Rules Engine**: prioritizes nudges (celebrate, unblock, cadence).  
- **Integrations**: Slack (slash commands, modals), Google Drive/Docs.  

---

## 3) Data Model

We store **metadata only**, not raw content.  

```sql
users(id, email, slack_user_id, google_sub, prefs, created_at)
oauth_tokens(user_id, provider, access_token, refresh_token, expiry)
docs_index(id, user_id, file_id, doc_type, title, path, person, date, tags)
signals(id, user_id, source, signal_type, value, payload, ts)
insights(id, user_id, category, summary, strength, related_doc_id, created_at)
nudges(id, user_id, type, message, status, sent_at, metadata)
```

---

## 4) Google Drive Taxonomy

- **Top folder**: `/mgmt-boost Manager Diary/`  
- **Subfolders**: `/Daily/`, `/1-1s/`, `/Meetings/`, `/Retros/`  
- **Naming convention**:  
  - `YYYY-MM-DD_Daily_Log`  
  - `YYYY-MM-DD_1-1_Sarah`  
  - `YYYY-MM-DD_Retro`  

---

## 5) Key Flows

**Boost**  
- `/boost` → API → LLM → Slack modal → user sends boosted message.  
- Store only scores + timestamp.  

**Diary**  
- `/diary 1-1 Sarah` → creates/links Google Doc → Slack DM link.  
- Index stored, content lives in Drive.  

**Weekly Digest**  
- Worker aggregates last 7 days signals + docs → sends Slack + email digest.  

---

## 6) Security & Privacy

- **No raw content stored**.  
- **OAuth scopes minimal** (Slack commands, Drive folder).  
- **Tokens encrypted at rest**.  
- **Row-level data isolation** per user.  
- **Nudge throttle** (max 1–2 per day).  

---

## 7) Deployment (MVP)

- Containerized API + worker(s).  
- Managed Postgres.  
- Cloud Scheduler for weekly digests.  
- Secrets in Secret Manager.  
- CI/CD with review gates.  

---

## 8) Roadmap

- **MVP**: Slack `/boost`, `/diary`, weekly digest, basic signals.  
- **Phase 2**: Zoom/Jira/GitHub hooks, recognition streaks.  
- **Phase 3**: Manager dashboard, advanced detectors, enterprise SSO.  

---

## 9) Open Questions

- Retention window: 30 vs 90 days?  
- Optional lightweight web viewer for docs index?  
- Which detectors ship in MVP vs Phase 2?  
