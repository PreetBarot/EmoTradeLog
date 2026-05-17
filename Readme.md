f# 🧠 EmoTradeLog — Full Project Documentation

> **Stack:** MERN (MongoDB, Express, React, Node.js) | **AI:** LangChain + RAG + LLMs | **Target:** Full-Stack AI SaaS Trading Journal

---

## 📌 Project Overview

**EmoTradeLog** is an AI-powered trading journal and analytics platform that helps traders track, analyze, and improve their trading performance. Unlike traditional trade loggers, EmoTradeLog focuses deeply on the **emotional and psychological side of trading** — using AI to detect FOMO, revenge trading, overconfidence, and other behavioral patterns that silently destroy profitability.

**Core Philosophy:** Every trade has a story. EmoTradeLog reads that story, finds the patterns, and helps traders write a better one.

---

## 🗂️ Full Folder Structure

```
EmoTradeLog/
│
├── 
│
├── ai/                                # Python AI Microservice (FastAPI)
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point
│   │   ├── config.py                  # LLM config (model, temp, keys)
│   │   ├── routes/
│   │   │   ├── emotion.py             # Emotion detection endpoint
│   │   │   ├── coach.py               # Trade coach analysis
│   │   │   ├── weekly_report.py       # Weekly AI report generation
│   │   │   ├── screenshot.py          # Chart screenshot analyzer
│   │   │   ├── chat.py                # Chat with your data (RAG)
│   │   │   ├── pattern.py             # Pattern finder
│   │   │   ├── risk.py                # Risk advisor
│   │   │   └── news.py                # News correlation engine
│   │   ├── chains/                    # LangChain chains
│   │   │   ├── emotion_chain.py
│   │   │   ├── coach_chain.py
│   │   │   ├── rag_chain.py           # RAG for chat-with-data
│   │   │   ├── report_chain.py
│   │   │   └── vision_chain.py        # Multimodal chain for screenshots
│   │   ├── vectorstore/               # RAG vector database
│   │   │   ├── embedder.py            # Text embedding logic
│   │   │   ├── indexer.py             # Indexes trade + journal docs
│   │   │   └── retriever.py           # Retrieves relevant docs for RAG
│   │   ├── prompts/                   # All LLM prompt templates
│   │   │   ├── emotion_prompt.py
│   │   │   ├── coach_prompt.py
│   │   │   ├── report_prompt.py
│   │   │   ├── screenshot_prompt.py
│   │   │   ├── chat_prompt.py
│   │   │   └── risk_prompt.py
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic request/response schemas
│   │   └── utils/
│   │       ├── trade_formatter.py     # Format trade data for LLM context
│   │       └── image_encoder.py       # Base64 encode chart screenshots
│   ├── requirements.txt
│   ├── .env
│   └── Dockerfile
│
├── docker-compose.yml                 # Runs all 3 services together
├── .gitignore
├── README.md
└── .env.example
```

---

## 🔧 Core Features

### 1. 📊 Dashboard
The command center of EmoTradeLog. Shows a real-time overview of the trader's performance.

**What it shows:**
- Total P&L (today / this week / this month / all-time)
- Win Rate, Profit Factor, Average R:R ratio
- Equity curve line chart
- P&L calendar heatmap (like GitHub contributions but for trades)
- AI-detected emotion summary for the week
- Top 3 performing strategies

**Tech:** React + Recharts / ApexCharts + MongoDB aggregation pipelines

---

### 2. 📋 Trades
A full trade log with filtering, sorting, and tagging.

**What it includes:**
- Manual trade entry form (Symbol, Direction, Entry/Exit price, SL, TP, Lot size, Date/Time)
- Auto-sync trades from MT5/MT4 via MetaApi (investor password, read-only)
- Tag each trade with: Strategy name, Session (London/NY/Asia), Market condition (Trending/Ranging/News)
- Filter trades by: date range, symbol, strategy, result (win/loss/BE), emotion tag
- Bulk import via CSV

**MT5 Sync Flow:**
```
User enters: Broker Server + Account No. + Investor Password
     ↓
Backend encrypts credentials (AES-256) → saves to MongoDB
     ↓
MetaApi connects (read-only) → fetches historical deals
     ↓
pairDeals() groups open+close into single trade objects
     ↓
Saved to Trade collection with ON CONFLICT (position_id) DO NOTHING logic
     ↓
Background poller runs every 5 min → fetches last 2 days to catch new trades
```

---

### 3. 📓 Journal
A rich-text journaling interface attached to each trade or trading session.

**Features:**
- Write journal notes per trade (pre-trade plan, post-trade reflection)
- Mood selector: 😤 Frustrated / 😰 Anxious / 😎 Confident / 😐 Neutral / 🔥 FOMO
- Tag emotional state at trade entry and exit
- Rate your discipline: Did you follow your plan? (1–5 stars)
- Upload chart screenshot for that trade
- Daily session journal (not tied to a specific trade)

**Why it matters:** Journal text is the PRIMARY input for the AI Emotion Detector and RAG-based "Chat with your Data" feature.

---

### 4. 📈 Analysis
Deep analytics section broken into sub-tabs.

**Sub-sections:**
- **Performance** — Win rate by symbol, session, strategy, day of week
- **Risk** — Average SL hit distance, R:R distribution histogram, max consecutive losses
- **Behavior** — Time-of-day heatmap (when do you win most?), average hold time by outcome
- **Streaks** — Win/loss streak tracker, equity drawdown periods
- **Comparison** — Month-over-month P&L and win rate comparison

**Tech:** MongoDB aggregation pipelines feed Express APIs; React renders with Recharts

---

### 5. 📰 Market
A market overview section — not for placing trades, but for context.

**What it shows:**
- Live price widgets for major pairs (Forex, indices, crypto) — via TradingView widget embed
- Economic calendar (upcoming high-impact news events) — via Forex Factory API or Finnhub
- Correlation with user's past trades on news days (feeds into the News Correlation AI feature)

---

## 🤖 AI Features Section

> All AI features live under the **"AI Features"** section in the sidebar (renamed from "AI Report").  
> Powered by: **LangChain** + **RAG (Retrieval-Augmented Generation)** + **LLMs (GPT-4o / Claude)**  
> AI runs as a separate **Python FastAPI microservice** in the `/ai` folder.

---

### 🔴 AI Feature 1: Emotion Detector
**The flagship feature. What makes EmoTradeLog different.**

**What it does:** Analyzes your journal notes, mood tags, and trade behavior to detect dangerous emotional patterns: FOMO, revenge trading, overconfidence, hesitation, and tilt.

**How it works (technical):**
```
User journal text + mood tags + trade outcome
         ↓
LangChain Emotion Chain → Prompt: "Analyze this journal for emotional trading patterns..."
         ↓
LLM returns structured JSON:
{
  "emotions_detected": ["FOMO", "Revenge Trading"],
  "severity": "High",
  "evidence": "Opened 3 trades within 10 min after a loss",
  "recommendation": "Take a 30-minute break after consecutive losses"
}
         ↓
Frontend shows EmotionBadge + detailed breakdown card
```

**Example output:**
> "On Tuesday you entered 3 trades within 12 minutes of a $240 loss. All 3 were losers. This is a textbook revenge trading pattern. Your win rate on trades opened within 15 minutes of a loss is 18% — compared to your overall 54%. Consider a mandatory cooldown rule."

**Prompt used (emotion_prompt.py):**
```python
EMOTION_PROMPT = """
You are a trading psychology expert. Analyze the following trading journal entry and trade data.
Identify: emotional state, any dangerous patterns (FOMO, revenge trading, overconfidence, tilt).
Return a JSON object with: emotions_detected, severity (Low/Medium/High), evidence, recommendation.

Journal: {journal_text}
Trade data: {trade_data}
Mood tag: {mood_tag}
"""
```

---

### 🟠 AI Feature 2: Trade Coach
**A personal mentor that reviews each trade like a senior trader would.**

**What it does:** After a trade is logged, the AI reviews entry reason, SL/TP placement, R:R ratio, outcome, and journal notes — then gives a scored review.

**Example output:**
> "Trade Score: 7/10. Your entry was clean — you waited for a confirmed break and retest. However, your SL was placed only 8 pips below structure, making you vulnerable to a stop hunt. Your TP was reasonable at 2.1R. Next time, widen the SL by 5–8 pips to account for spread and volatility. Your journaling on this trade was excellent — keep that habit."

**LangChain Chain:** `coach_chain.py`
- Input: trade object + journal text
- Prompt: Structured scoring rubric (entry quality, SL/TP quality, R:R, plan adherence)
- Output: score + markdown feedback text

---

### 🟡 AI Feature 3: Weekly AI Report
**A letter-grade performance report delivered every Sunday.**

**What it does:** Every week, the AI aggregates all trades, journal entries, and behavior patterns and produces a full report with an overall grade, strengths, weaknesses, and one key focus for next week.

**Report sections:**
- Overall Grade: A / B / C / D / F
- P&L Summary + vs. previous week
- Win rate analysis + which setups worked
- Emotional health score (from journal analysis)
- Top mistake of the week
- One actionable goal for next week

**Tech:** Scheduled cron job (node-cron) triggers every Sunday at 8 PM → calls AI microservice → saves report to `AIReport` MongoDB collection → user sees it in the Weekly Report page.

**LangChain Chain:** `report_chain.py` with `StructuredOutputParser`

---

### 🟢 AI Feature 4: Screenshot Analyzer (Vision AI)
**Upload a chart screenshot → AI grades your setup.**

**What it does:** The trader uploads a screenshot of a chart setup (before or after a trade). The Vision AI analyzes the chart and gives a structured critique: Was the entry logical? Were support/resistance respected? Was the trend direction correct?

**How it works:**
```
User uploads chart screenshot (PNG/JPG)
         ↓
Backend (Multer) saves to /uploads
         ↓
Image base64-encoded → sent to AI microservice
         ↓
LangChain Vision Chain → GPT-4o vision model
Prompt: "Analyze this forex chart. Identify key levels, trend direction, 
         quality of the marked entry/exit points. Score from 1-10 with reasoning."
         ↓
Returns: Setup Score, Key Observations, What was done well, What to improve
```

**Why it's resume-worthy:** Demonstrates multimodal AI integration (vision LLMs), which most junior developers have not built.

---

### 🔵 AI Feature 5: Chat With Your Data (RAG)
**"Ask me anything about my trading history in plain English."**

**What it does:** The trader types natural language questions and the AI answers using their actual trade and journal data — not generic advice.

**Example queries:**
- "Why do I lose on Fridays?"
- "What is my best performing strategy this month?"
- "Show me all my revenge trades in Q1"
- "What was my emotion on my best winning streak?"
- "Am I more profitable during London or New York session?"

**How RAG works:**
```
All trades + journal entries → chunked into text documents
         ↓
Embedded using OpenAI text-embedding-3-small / HuggingFace
         ↓
Stored in ChromaDB (local vector store) — one collection per user
         ↓
User asks a question → query embedded → top-k similar chunks retrieved
         ↓
LangChain RAG Chain: [retrieved context] + [user question] → LLM → answer
         ↓
Response displayed in ChatWithData.jsx with source citations
```

**LangChain components used:**
- `RecursiveCharacterTextSplitter` for chunking
- `OpenAIEmbeddings` or `HuggingFaceEmbeddings`
- `Chroma` as vector store
- `RetrievalQA` chain with custom prompt

---

### 🟣 AI Feature 6: Pattern Finder
**Finds invisible patterns in your trade data that you'd never see manually.**

**What it does:** Runs a batch AI analysis across all trades and surfaces statistically-backed patterns.

**Example patterns found:**
- "You win 71% of trades on Tuesday between 9–11 AM London time"
- "Your EUR/USD short trades have a 23% win rate — avoid this setup"
- "Trades where you journaled before entry have 2.4x better outcomes"
- "You hold losing trades 3x longer than winning trades on average"

**Tech:** MongoDB aggregation generates the statistical data. LLM adds natural-language interpretation and ranks patterns by significance.

---

### ⚪ AI Feature 7: Risk Advisor
**A pre-trade warning system based on your personal behavior history.**

**What it does:** Before entering a trade (manually logged), the trader fills in the setup details. The AI checks their history and warns if the setup matches a historically poor pattern.

**Example warning:**
> "⚠️ Caution: You have a 22% win rate on GBP/USD shorts during high-impact news windows. There is an NFP release in 45 minutes. Your last 6 trades in this scenario all hit SL. Proceed with reduced size or wait for the dust to settle."

**Tech:** LangChain chain with user's historical trade statistics injected into the prompt context.

---

### 🔶 AI Feature 8: News Correlation Engine
**Finds if news events are secretly hurting your performance.**

**What it does:** Cross-references your trade timestamps with a database of economic news events (NFP, CPI, FOMC, etc.) and analyzes win rates around those events.

**Example insight:**
> "Your win rate drops from 58% to 21% in the 30 minutes before and after NFP releases. You have traded through 14 NFP events. Consider adding an 'NFP blackout window' rule to your trading plan."

**Data sources:** Forex Factory API or Finnhub economic calendar → stored in MongoDB → correlated with trade timestamps via aggregation.

---

## 🗄️ Database Schema (MongoDB)

### User
```javascript
{
  _id, name, email, password (hashed),
  plan: "free" | "pro",
  createdAt, updatedAt
}
```

### Trade
```javascript
{
  _id, userId, positionId (MT5 position ID),
  symbol, direction: "buy" | "sell",
  entryPrice, exitPrice, stopLoss, takeProfit,
  lotSize, pnl, commissions, swap,
  openTime, closeTime, holdDurationMinutes,
  strategy, session: "London" | "NY" | "Asia" | "Sydney",
  marketCondition: "Trending" | "Ranging" | "News",
  result: "win" | "loss" | "breakeven",
  tags: [],
  source: "manual" | "mt5_sync",
  screenshotUrl,
  createdAt
}
```

### Journal
```javascript
{
  _id, userId, tradeId (optional, for session journals = null),
  preTradePlan, postTradeReflection,
  moodAtEntry: "confident" | "anxious" | "fomo" | "frustrated" | "neutral",
  moodAtExit,
  disciplineScore: 1-5,
  lessonsLearned,
  aiEmotionTags: [],         // filled by Emotion Detector
  aiEmotionSeverity,         // filled by Emotion Detector
  createdAt
}
```

### MT5Account
```javascript
{
  _id, userId,
  brokerServer, accountNumber,
  passwordEncrypted,          // AES-256 encrypted investor password
  isConnected, lastSyncAt,
  createdAt
}
```

### AIReport
```javascript
{
  _id, userId,
  reportType: "weekly" | "monthly",
  weekStartDate, weekEndDate,
  grade, summary, strengths, weaknesses,
  emotionalHealthScore,
  keyFocusForNextWeek,
  rawMarkdown,
  createdAt
}
```

---

## 🔌 Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS | Utility-first styling |
| Charts | Recharts / ApexCharts | Trade analytics visualization |
| TradingView | lightweight-charts | Trade replay charts |
| Routing | React Router v6 | Page routing |
| State | Context API + React Query | Global + server state |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB + Mongoose | Trade/user data storage |
| Auth | JWT + bcrypt | Secure authentication |
| MT5 Sync | MetaApi SDK | Read-only MT5 trade history |
| Encryption | AES-256 (crypto-js) | Investor password storage |
| Background Jobs | node-cron | Auto-sync + weekly report trigger |
| File Upload | Multer | Chart screenshot uploads |
| AI Microservice | Python + FastAPI | AI endpoint routing |
| LLM Orchestration | LangChain (Python) | Chain management |
| LLM Models | GPT-4o / GPT-4o-mini | Text + vision analysis |
| RAG Vector Store | ChromaDB | Semantic search over trade data |
| Embeddings | OpenAI text-embedding-3-small | Text vectorization |
| Containerization | Docker + Docker Compose | Run all 3 services together |

---

## 🔐 Security Considerations

1. **Investor Password Encryption** — Stored using AES-256 before saving to MongoDB. The key lives only in environment variables, never in code.
2. **Read-only MT5 access** — Investor password cannot place trades, only read history. Clearly communicated to users in UI.
3. **JWT Auth** — All API routes protected. Tokens expire in 7 days with refresh token support.
4. **Rate Limiting** — express-rate-limit applied to AI endpoints (expensive LLM calls).
5. **Input Sanitization** — All user inputs sanitized with express-validator before DB writes.
6. **CORS** — Strict CORS policy allowing only the frontend origin.

---

## 🚀 Build Order (Recommended for Resume Project)

| Phase | What to Build | Time Estimate |
|---|---|---|
| Phase 1 | Auth (register/login) + Manual Trade Entry + Dashboard | 1–2 weeks |
| Phase 2 | Journal + Analysis Charts + P&L Heatmap | 1 week |
| Phase 3 | MT5 Sync via MetaApi + Background Polling | 1 week |
| Phase 4 | AI: Weekly Report + Emotion Detector (easiest AI features) | 1 week |
| Phase 5 | AI: Chat With Data (RAG) + Screenshot Analyzer (Vision) | 1–2 weeks |
| Phase 6 | AI: Pattern Finder + Risk Advisor + News Correlation | 1 week |
| Phase 7 | Polish UI + Deployment (Vercel + Render + Railway) | 3–5 days |

**Total:** ~6–8 weeks for a full, resume-ready version.

---

## 📝 Resume Bullet Points (Copy-Paste Ready)

```
• Built EmoTradeLog, a full-stack AI SaaS trading journal using MERN stack with a 
  Python FastAPI AI microservice powered by LangChain and GPT-4o

• Implemented MT5 auto-sync via MetaApi (investor password / read-only) with AES-256 
  encrypted credential storage and automated background polling every 5 minutes

• Built a RAG pipeline using LangChain + ChromaDB to let traders query their entire 
  trade history in natural language (e.g., "Why do I lose on Fridays?")

• Developed a multimodal AI Screenshot Analyzer using GPT-4o Vision that grades 
  chart setups with structured scoring and improvement recommendations

• Designed an Emotion Detector using LangChain chains and journal text analysis to 
  identify FOMO, revenge trading, and tilt patterns with severity scoring

• Created a Weekly AI Report system (LangChain StructuredOutputParser + node-cron) 
  that generates letter-graded performance reports with actionable insights every Sunday
```

---

## 🌐 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel (free tier) |
| Backend (Node) | Render or Railway (free tier) |
| AI Microservice | Render (Docker) or Hugging Face Spaces |
| MongoDB | MongoDB Atlas (free 512MB) |
| Vector Store | ChromaDB (embedded, runs inside AI service) |

---

*EmoTradeLog Shubham — Built with MERN + LangChain + RAG. Where every trade tells a story.*