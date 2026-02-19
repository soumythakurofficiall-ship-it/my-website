# StreakRank MVP (Phase 1 Build)

A single-file, mobile-first prototype implementing the first build iteration:
- Homepage (Hero, CTA, features, social proof, footer)
- Dashboard UI (login/signup tabs, XP, leaderboard, progress)
- Dummy gamification logic (state-based rendering + subtle animations)

## Quick Start
Open `index.html` in any modern browser.

## Project Structure
- `index.html` — complete HTML/CSS/JS MVP
- `assets/images/` — future image assets
- `assets/icons/` — future icon set
- `docs/` — product and implementation notes

---

# Viral-Ready Website Plan (India Gen-Z, 2026)

## 1) Chosen Niche
**AI Study + Exam Prep Gamification** for Indian students preparing for competitive exams (JEE/NEET/CUET/SSC/Banking) and college semester tests.

**Working concept name:** **StreakRank**

A mobile-first platform where students turn daily prep into social challenges, AI-powered revision sprints, and leaderboard-driven progress.

---

## 2) Strategic Foundation

### Target audience
- Age 16–24 (Class 11/12, droppers, college students)
- Tier 1/2/3 India, Android-first, price-sensitive users
- Heavy Instagram/Reels/YouTube Shorts consumers
- Motivation drops quickly without social accountability

### Core problem
Students struggle with:
- Consistency (start strong, lose momentum)
- Revision planning (what to study next)
- Boring, lonely prep experience
- No visible “status” for their discipline

### Unique viral hook
**“Proof-of-Study” social cards + streak battles**
- Every study sprint auto-generates a shareable result card: minutes studied, topic mastery, XP gained, rank jump.
- Weekly “City vs City” and “Branch vs Branch” challenges trigger social identity and bragging rights.

### Monetization model
1. **Freemium**
   - Free: basic sprints, streaks, limited AI planner
   - Pro (₹99–₹299/month): advanced AI study coach, detailed analytics, unlimited mocks
2. **Microtransactions**
   - Premium themes, profile badges, limited avatar drops
3. **Affiliate & partnerships**
   - Test series platforms, edtech tools, stationery brands
4. **B2B mini-offers** (later)
   - Campus communities / coaching centers dashboard

### Competitive advantage
- Emotion-first experience (status + social proof), not just test content
- Built for low attention span: short sessions, dopamine loops, instant feedback
- India-native triggers: exams, language mix, WhatsApp share patterns, affordable pricing

---

## 3) Website Structure

### Homepage sections
1. **Hero:** “Turn Study Hours into Rank & Reputation” + CTA (Start Free)
2. **Live social proof ticker:** students currently in sprints, total minutes today
3. **How it works (3 steps):** Plan → Sprint → Share
4. **Viral cards showcase:** real sample share cards
5. **Gamification explainer:** streaks, XP, leagues, duels
6. **Exam tracks:** JEE / NEET / CUET / UPSC-lite / Semester mode
7. **Testimonials + UGC clips**
8. **Pricing + FAQ**
9. **Sticky mobile CTA bar**

### Key features
- AI daily study planner based on exam + weak topics
- 25/45/60 min focus sprints with distraction lock prompts
- Smart revision queue (spaced repetition-lite)
- Mock quiz generator from uploaded notes/PDF snippets
- Rank system (Bronze → Diamond → Legend)

### User dashboard features
- Today’s plan with adaptive tasks
- Streak health meter + risk alerts (“streak in danger”)
- Topic mastery heatmap
- Weekly report (time, accuracy, consistency)
- Squad panel (friends, class group, challenge invites)

### Gamification elements
- XP per session + bonus XP for consistency
- Daily streak freeze token (earnable)
- Weekly leagues with promotion/relegation
- Limited-time quests (7-day Physics comeback quest)
- Boss battles: timed challenge exams

### Social sharing mechanics
- One-tap share cards for Instagram Story, WhatsApp, Snapchat
- “Challenge 3 friends” deep link templates
- Team leaderboard snapshots for groups
- Referral rewards tied to streak milestones (not just sign-up)

---

## 4) Practical Tech Stack (Solo Developer Friendly)

### Frontend
- **Next.js (App Router) + TypeScript + Tailwind CSS**
- Why: fast iteration, SEO pages + app experience, reusable UI system

### Backend
- **Supabase** (Auth, Postgres, Storage, Edge Functions)
- Why: minimal backend ops, real-time capabilities, built-in auth

### Database
- **PostgreSQL (Supabase managed)**
- Core tables: users, goals, sessions, streaks, challenges, referrals, leaderboards

### Hosting
- **Vercel** for frontend
- Supabase managed backend
- Optional Cloudflare for caching, WAF, image optimization

### AI integrations
- LLM API (OpenAI/compatible) for:
  - Daily plan generation
  - Weak-topic diagnosis
  - Note-to-quiz generation
- Guardrails:
  - token limits, caching, fallback templates
  - keep AI as assistant, not source of factual final answers for critical exam theory

---

## 5) Growth Strategy

### Viral loops
- Share card includes dynamic hook: “I studied 186 mins today. Beat me?”
- Public profile pages indexed for SEO + social validation
- Weekly regional contests with sharable rank posters
- Referral chain: unlock premium quest packs when referred users hit 3-day streak

### Reels/Shorts strategy
- Content pillars:
  1. “Study challenge transformations”
  2. “Exam prep myths busted in 20 sec”
  3. “Leaderboard drama / comeback stories”
- Hook format: “POV: Your friend crossed 30-day streak before you.”
- CTA: Join challenge via short link + prefilled invite

### SEO plan
- Programmatic pages:
  - `/jee-study-plan-30-days`
  - `/neet-revision-timetable`
  - `/pomodoro-for-students-india`
- Topic clusters around exam timelines, productivity, revision strategy
- Internal linking from blogs to challenge pages and signup

### Community-building approach
- Discord/Telegram “streak clubs” by exam type
- Campus ambassadors: leaderboard captains per college/coaching hub
- Monthly online tournaments with sponsor prizes

---

## 6) UI/UX Direction

### Color theme
- Dark-first base: charcoal/ink background
- Neon accent system:
  - electric purple (primary)
  - cyan (secondary)
  - lime/yellow for achievement highlights

### Visual style
- Futuristic + playful (glow cards, depth gradients)
- Short text blocks, high-contrast metrics, card-first layout
- Meme-friendly, screenshot-worthy states

### Mobile-first strategy
- Bottom nav optimized for thumb reach
- Session start in <2 taps
- Offline-tolerant session logging + sync later
- Lightweight assets for low-end Android devices

### Micro-interactions
- XP burst animation after session completion
- Haptic-like visual feedback on streak continuation
- Progress rings animate in under 400ms
- Confetti reserved for milestone moments (avoid fatigue)

---

## 7) MVP Roadmap (Realistic for Solo Build)

### Phase 1 (0–6 weeks) — Launchable MVP
- Auth + onboarding (exam track, daily goal)
- Focus sprints with timer + session logging
- Basic streak engine + XP system
- Shareable result card generation
- Minimal leaderboard (friends/global)
- Landing page + waitlist + referral tracking

**Success metric:** D7 retention > 20%, at least 25% users sharing once/week

### Phase 2 (6–12 weeks) — Retention Layer
- AI study planner
- Topic mastery dashboard
- Weekly leagues and challenges
- Push notifications/WhatsApp reminders
- Pro subscription (Razorpay integration)

**Success metric:** 8–12% free-to-paid conversion among active users

### Phase 3 (3–6 months) — Scale & Moat
- Advanced mocks + personalized revision loops
- Campus/community leader tools
- Programmatic SEO content engine
- Brand partnerships + affiliate marketplace

**Success metric:** strong organic growth loop and CAC < LTV by healthy margin

---

## Positioning Statement
**StreakRank is Duolingo-meets-Strava for Indian exam prep**—where discipline becomes identity, progress becomes social currency, and studying becomes share-worthy.
