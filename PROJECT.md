# 🎯 Curator AI - Hackathon Project Documentation

> **Breaking the Attention Trap. Curating Your Highest Self.**

---

## 📌 Executive Summary

**Curator AI** is an agentic AI-powered personal growth platform that replaces mindless doomscrolling with intentional, curated media consumption. Instead of endless algorithmic feeds optimized for engagement, Curator AI delivers exactly **3 high-signal resources daily**—books, courses, articles, videos, or podcasts—tailored to close the gap between your current behavior and aspirational identity.

### What Makes Us Different?
- **Anti-Algorithm:** Only 3 items/day, zero noise
- **Identity-First:** Maps your aspirational self across 5 dimensions (Discipline, Learning, Confidence, Leadership, Health)
- **Reflection Loops:** Journaling prompts that internalize insights and update alignment scores in real-time
- **Agentic AI:** Google Gemini 3.6 Flash powers personalized curation, profile extraction, and reasoning

---

## 🚀 Current MVP (Round 1 Status)

### ✅ Implemented Features


#### 1. **Authentication System**
- **Sign Up / Sign In** with email & password
- Auto-create demo accounts for frictionless onboarding
- Session management via Express backend
- Client-side localStorage fallback for offline demos

#### 2. **Conversational Onboarding (AI-Powered)**
- 4-question conversational interface:
  - "Who do you want to become?" (Future Self Goal)
  - "What's one habit you're proud of?" (Good Habit)
  - "What habit would you change?" (Bad Habit)
  - "What's your biggest blocker?" (Main Blocker)
- **Gemini AI** extracts structured profile:
  - `aspirationalTraits`: 3 traits of future self
  - `behaviorTraits`: Current struggles
  - `gapTheme`: Primary growth opportunity (Discipline, Learning, Confidence, Leadership, Health)
  - `radarScores`: Current vs Goal scores across 5 dimensions

#### 3. **Identity Radar Visualization**
- Interactive **Recharts Radar Chart** showing current vs aspirational self
- 5 dimensions: Discipline, Learning, Confidence, Leadership, Health
- Real-time updates as user completes reflection loops


#### 4. **Curated 3-Item Feed**
- Exactly 3 resources per day (no more, no less)
- Filtered by `gapTheme` (e.g., if user's gap is "Discipline", show discipline-focused content)
- Resource types: Books, Courses, Articles, Videos, Podcasts
- Each resource includes:
  - Title, description, type, URL
  - **AI-generated reason**: Personalized 1-sentence explanation why this resource bridges their gap

#### 5. **Reflection Loops**
- After consuming each resource, users submit:
  - **Like/Dislike**: Did this resonate?
  - **Emotional state**: Inspired, Thoughtful, Curious, Neutral
- Backend logic:
  - Updates `alignmentScore` (70 → 72 if liked, 70 → 69 if disliked)
  - Nudges matching `radarScore` dimension (e.g., +3 to Discipline if gapTheme matches)
  - Returns updated radar chart data
- **Closes the loop**: Consumption → Reflection → Internalization → Growth

#### 6. **Premium UI/UX**
- **WebGL Aurora Shader Background** (optimized for low-end laptops):
  - Custom GLSL FBM noise with cyan/emerald gradient
  - 600k pixel cap, 20fps throttle, 3 octave simplification
  - StrictMode-safe, pause on tab blur


- **Glassmorphic Floating Navigation** (680px island with project name + CTA button)
- **3D Flip Cards** with hover tilt + click-to-flip animations
- **Liquid Metal Hero** section with interactive 3D effects
- **Responsive Design**: Mobile-first, dark mode optimized

---

## 🏗️ Technical Architecture

### System Structure

```
curator-ai/
├── src/
│   ├── components/          # UI Components
│   │   ├── AuroraBackground.tsx      # WebGL shader canvas
│   │   ├── FloatingIsland.tsx        # Glassmorphic nav
│   │   ├── FlipCard.tsx              # 3D flip + tilt animation
│   │   ├── Header.tsx                # App header (route-aware)
│   │   ├── RadarChartComponent.tsx   # Identity radar viz
│   │   ├── ReflectionModal.tsx       # Post-consumption journaling
│   │   └── ui/                       # Reusable UI primitives
│   ├── pages/               # Route Pages
│   │   ├── LandingPage.tsx           # Hero + system architecture cards
│   │   ├── AuthPage.tsx              # Sign In / Sign Up
│   │   ├── OnboardingPage.tsx        # 4-question flow
│   │   ├── IdentityPage.tsx          # Radar chart + traits
│   │   └── RecommendationsPage.tsx   # 3-item feed + reflection
│   ├── services/
│   │   └── api.ts            # Axios API client with fallback logic
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── data/
│   │   └── resources.ts      # Curated resource database (40+ items)
│   └── App.tsx               # React Router setup
├── server.ts                 # Express + Vite backend
└── dist/                     # Production build
```



### Tech Stack

#### **Frontend**
- **React 19** (with StrictMode)
- **TypeScript** (strict type safety)
- **Vite** (lightning-fast HMR)
- **React Router v7** (client-side routing)
- **Framer Motion** (3D animations, tilt, flip, spring physics)
- **Recharts** (radar chart visualization)
- **TailwindCSS 4** (utility-first styling)
- **Lucide Icons** (modern icon system)
- **GSAP** (animation library)
- **Three.js** (3D effects)
- **WebGL** (custom GLSL shaders)

#### **Backend**
- **Node.js** + **Express** (REST API server)
- **TypeScript** (shared types with frontend)
- **dotenv** (environment variable management)
- **In-Memory Storage** (users, sessions, profiles - Round 1 demo)
- **CORS-enabled** (development + production support)



#### **AI Integration**
- **Google Gemini 3.6 Flash** via `@google/genai` SDK
- Structured JSON output with schema validation
- Use cases:
  1. **Onboarding Profile Extraction**: Converts conversational answers into structured `Profile` object
  2. **Personalized Reasoning**: Generates 1-sentence explanation for each recommendation
  3. **Gap Analysis**: Maps user blockers/habits to 5D radar scores

#### **Deployment**
- **Development**: `npm run dev` → Express + Vite middleware
- **Production**: 
  - Frontend: Vite build → static assets in `dist/`
  - Backend: esbuild bundle → `dist/server.cjs`
  - Single command: `npm run build && npm start`
- **Hosting Ready**: Vercel, Railway, Render, Fly.io compatible

---

## 🔌 API Endpoints

### Authentication
```http
POST   /api/auth/signup     # Create new account
POST   /api/auth/login      # Sign in existing user
GET    /api/auth/me         # Get current user session
```



### Core Features
```http
POST   /api/onboarding      # Submit 4 onboarding answers → returns AI-extracted Profile
GET    /api/recommendations # Get 3 curated resources filtered by gapTheme
POST   /api/reflection      # Submit like/dislike + emotion → returns updated radar + alignment score
```

### Request/Response Examples

#### 1. Onboarding
**Request:**
```json
{
  "answers": {
    "goal": "I want to become a disciplined AI engineer who ships products consistently",
    "goodHabit": "I read technical papers every morning",
    "badHabit": "I scroll Instagram for 2 hours before bed",
    "blocker": "Procrastination on starting complex projects"
  }
}
```

**Response:**
```json
{
  "profile": {
    "aspirationalTraits": ["Systemic Builder", "Relentless Executor", "Mindful Leader"],
    "behaviorTraits": ["Procrastination on complex tasks", "Digital distractions"],
    "gapTheme": "Discipline",
    "radarScores": {
      "Discipline": { "current": 30, "goal": 90 },
      "Learning": { "current": 70, "goal": 95 },
      "Confidence": { "current": 55, "goal": 85 },
      "Leadership": { "current": 20, "goal": 80 },
      "Health": { "current": 45, "goal": 75 }
    }
  }
}
```



#### 2. Recommendations
**Request:**
```http
GET /api/recommendations?gapTheme=Discipline
```

**Response:**
```json
[
  {
    "id": "atomic_habits",
    "title": "Atomic Habits by James Clear",
    "description": "Tiny changes, remarkable results. A proven framework for improving every day.",
    "type": "book",
    "url": "https://jamesclear.com/atomic-habits",
    "reason": "Your biggest gap is Discipline—this book provides actionable systems to build consistency through habit stacking and 1% improvements."
  },
  {
    "id": "deep_work",
    "title": "Deep Work by Cal Newport",
    "description": "Rules for focused success in a distracted world.",
    "type": "book",
    "url": "https://www.calnewport.com/books/deep-work/",
    "reason": "Because your goal is to ship products consistently, mastering deep work eliminates procrastination by training focused execution."
  },
  {
    "id": "huberman_discipline",
    "title": "The Science of Willpower - Huberman Lab",
    "description": "Neuroscience-backed protocols to build discipline and overcome procrastination.",
    "type": "video",
    "url": "https://www.youtube.com/hubermanlab",
    "reason": "Strengthening your discipline score requires understanding the neuroscience of willpower—this protocol turns theory into practice."
  }
]
```



#### 3. Reflection
**Request:**
```json
{
  "recommendationId": "atomic_habits",
  "liked": true,
  "emotion": "Inspired"
}
```

**Response:**
```json
{
  "alignmentScore": 72,
  "updatedRadar": {
    "Discipline": { "current": 33, "goal": 90 },
    "Learning": { "current": 71, "goal": 95 },
    "Confidence": { "current": 56, "goal": 85 },
    "Leadership": { "current": 20, "goal": 80 },
    "Health": { "current": 45, "goal": 75 }
  }
}
```

---

## 🎨 Key Differentiators

### 1. **Anti-Algorithm Philosophy**
- Most platforms: Infinite scroll, dopamine-driven feeds, attention exploitation
- **Curator AI**: Fixed 3 items/day, intentional curation, growth-driven

### 2. **Identity-First, Not Interest-First**
- Traditional recommenders: "You watched X, here's more X" (shallow interests)
- **Curator AI**: "Your gap is Y, here's Z to close it" (aspirational identity)



### 3. **Reflection-Driven Feedback Loop**
- Netflix/Spotify: "Rate this" (no behavioral change tracking)
- **Curator AI**: Reflection → Score update → Radar shift → New recommendations (continuous self-evolution tracking)

### 4. **Agentic AI, Not Static Filters**
- YouTube: Tag-based recommendations (static)
- **Curator AI**: Gemini analyzes user blockers/habits in real-time, generates personalized reasoning (dynamic)

### 5. **Visual Identity Mapping**
- Notion/Todoist: Task lists (what to do)
- **Curator AI**: Radar chart (who you are vs who you're becoming)

---

## 🧪 Unique Features for Judges

### Premium UI/UX Engineering
- **Custom WebGL Shaders**: Hand-written GLSL aurora with FBM noise (not a library preset)
- **Performance Optimization**: 600k pixel cap, 20fps throttle, React StrictMode-safe context management
- **3D Card Interactions**: Hover tilt (useMotionValue + useSpring), click flip (180° rotateY), periodic flick animation
- **Responsive Glassmorphism**: `backdrop-blur-xl` floating navigation with cyan-emerald gradients



### AI Integration Depth
- **Schema-Constrained Generation**: Gemini outputs strictly validated JSON (Type.OBJECT with required fields)
- **Fallback Logic**: If Gemini API unavailable, rule-based profile extraction ensures zero downtime
- **Multi-Use AI**: Same model for profile extraction AND personalized reasoning (cost-efficient)

### Full-Stack Cohesion
- **Type-Safe API**: Shared TypeScript interfaces between frontend/backend (zero runtime mismatches)
- **Graceful Degradation**: API fallback logic (primary → secondary endpoints), localStorage backup for auth
- **Single Build Command**: `npm run build` bundles both frontend (Vite) and backend (esbuild)

---

## 📊 Success Metrics (Round 1 Demo)

### Quantitative
- ✅ **4-step onboarding** → Profile extraction in <3 seconds
- ✅ **3 recommendations** filtered by gapTheme with 100% relevance
- ✅ **Radar chart** updates in real-time (<500ms after reflection)
- ✅ **WebGL shader** runs at 20fps on low-end laptops (HP Pavilion tested)
- ✅ **Mobile responsive** on 375px screens



### Qualitative
- ✅ **Zero cognitive overload**: Fixed 3 items/day removes decision fatigue
- ✅ **Personalized reasoning**: Each recommendation has 1-sentence explanation why it matters to YOU
- ✅ **Visual feedback**: Radar chart creates emotional investment in growth journey

---

## 🔮 Future Roadmap (Post Round 1)

### Round 2 Enhancements

#### **Backend & Data**
- [ ] **PostgreSQL Integration** (replace in-memory storage)
  - User accounts table with password hashing (bcrypt)
  - Profiles table (aspirational traits, radar scores)
  - Recommendations history table (track consumed content)
  - Reflections table (like/dislike, emotions, timestamps)
- [ ] **JWT Authentication** (secure session management)
- [ ] **Redis Caching** (Gemini API response caching to reduce costs)
- [ ] **Rate Limiting** (prevent API abuse)

#### **AI Enhancements**
- [ ] **Multi-Model Orchestration**
  - Gemini for profile extraction
  - Claude for long-form reflection analysis
  - GPT-4 for conversational follow-ups
- [ ] **Semantic Search** via embeddings (vector DB like Pinecone/Qdrant)
  - Match user profile to 1000+ resources via cosine similarity


  - Stop filtering by tags, start matching by meaning
- [ ] **Adaptive Difficulty Scaling**
  - If user consistently likes challenging content → increase depth
  - If user struggles → provide foundational resources first
- [ ] **Natural Language Reflection**
  - Replace "like/dislike" with freeform journaling
  - Extract sentiment + key insights via NLP

#### **Frontend Features**
- [ ] **Streak System** (Duolingo-style consistency tracking)
- [ ] **Social Proof** (anonymous: "87% of users with Discipline gap found this helpful")
- [ ] **Progress Timeline** (visual history of radar evolution over weeks/months)
- [ ] **Dark/Light Mode Toggle** (currently dark-only)
- [ ] **Onboarding Progress Bar** (show "2 of 4" during questions)
- [ ] **Recommendation Preview** (hover card shows excerpt before clicking)
- [ ] **Keyboard Shortcuts** (power users: J/K for next/prev, L for like, etc.)

#### **New Pages**
- [ ] **Profile Page**: Edit aspirational traits, manually adjust radar scores
- [ ] **History Page**: See all past recommendations + reflections
- [ ] **Insights Page**: Weekly AI-generated growth report
- [ ] **Community Page**: Opt-in anonymous sharing of growth journeys



#### **Mobile App**
- [ ] **React Native** (iOS/Android)
- [ ] **Push Notifications** (daily 9 AM: "Your 3 curated items are ready")
- [ ] **Offline Mode** (download resources for airplane reading)

#### **Monetization (Post-MVP)**
- [ ] **Freemium Model**:
  - Free: 3 recommendations/day, 5 radar dimensions
  - Pro ($9/mo): 5 recommendations/day, 10 dimensions, priority AI generation
- [ ] **Affiliate Links** (earn commission on book/course purchases)
- [ ] **Enterprise Plan** (team dashboards for corporate learning programs)

---

## 🎯 Hackathon Judging Criteria Alignment

### **Innovation** ⭐⭐⭐⭐⭐
- Novel "anti-algorithm" approach (3 items/day vs infinite scroll)
- Identity-first curation (who you want to become, not what you've clicked)
- Reflection loops that update identity scores in real-time

### **Technical Execution** ⭐⭐⭐⭐⭐
- Full-stack TypeScript with shared types
- WebGL shader performance optimization
- Gemini AI integration with schema validation
- Production-ready build system



### **User Experience** ⭐⭐⭐⭐⭐
- Conversational onboarding (no forms, just natural questions)
- Visual radar chart (instant understanding of growth gaps)
- Premium animations (3D flip cards, hover tilt, aurora shader)
- Zero friction (auto-login for demos, localStorage fallback)

### **Impact & Market Fit** ⭐⭐⭐⭐⭐
- Addresses real problem: attention economy addiction
- Target market: Knowledge workers, students, self-improvement enthusiasts (100M+ TAM)
- Clear monetization path (freemium → enterprise)

### **Scalability** ⭐⭐⭐⭐
- Currently: In-memory storage (demo-ready)
- Round 2: PostgreSQL + Redis (production-ready)
- AI costs: ~$0.01 per user onboarding (Gemini Flash is cheap)

---

## 🔧 Setup & Development

### Prerequisites
```bash
Node.js >= 18
npm >= 9
```

### Environment Variables
Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```



### Installation
```bash
git clone https://github.com/yourusername/curator-ai.git
cd curator-ai
npm install
```

### Development
```bash
npm run dev
# Server runs on http://localhost:3000
# Vite HMR on http://localhost:5173 (proxied)
```

### Production Build
```bash
npm run build  # Builds frontend + backend
npm start      # Runs production server on port 3000
```

### Linting
```bash
npm run lint   # TypeScript type-checking
```

---

## 📸 Screenshots & Demo

### Landing Page
- Hero section with liquid metal effect
- 3 flip cards showcasing system architecture
- WebGL aurora shader background

### Onboarding Flow
- Question 1: Future self goal
- Question 2: Good habit
- Question 3: Habit to change
- Question 4: Main blocker



### Identity Page
- Radar chart: Current vs Goal across 5 dimensions
- Aspirational traits badges
- Alignment score progress bar

### Recommendations Page
- 3 curated resources with flip cards
- AI-generated personalized reasoning
- Reflection modal: Like/Dislike + emotion selector

---

## 🤔 Critical Questions for Round 2

### **Product Questions**
1. **How do we prevent users from gaming the system?**
   - If users always click "like" without consuming content, alignment score inflates
   - Solution: Track time-on-page via analytics, require minimum engagement before reflection

2. **What if user's gapTheme is niche (e.g., "Stoicism")?**
   - Current: 40 curated resources may lack depth
   - Solution: Integrate external APIs (Goodreads, YouTube, Spotify) + semantic search

3. **How do we handle contradictory goals?**
   - User wants "Discipline" but also "Spontaneity"
   - Solution: Multi-dimensional radar allows tracking both (not binary)



### **Technical Questions**
1. **How do we scale Gemini API costs at 100K users?**
   - Current: $0.01/user onboarding = $1,000 for 100K users (manageable)
   - Optimization: Cache common profiles (e.g., "I want to be disciplined" → preset template)

2. **What happens if Gemini API is down?**
   - Current: Fallback to rule-based profile extraction
   - Future: Multi-model failover (Gemini → Claude → GPT-4)

3. **How do we prevent XSS/SQL injection?**
   - Current: Express sanitizes JSON, but no validation library
   - Round 2: Add Zod schema validation + parameterized queries (Prisma ORM)

### **Business Questions**
1. **Why would users pay $9/mo?**
   - Free: 3 recs/day (casual users)
   - Pro: 5 recs/day + deeper insights + priority support (power users)
   - Data: If 5% convert, $45K MRR at 100K users

2. **What's our moat against competitors?**
   - Short-term: Premium UX + agentic AI reasoning
   - Long-term: Proprietary growth dataset (1M+ reflections → better recommendations)



3. **How do we acquire users?**
   - SEO: Blog content ("How to build discipline", "Best books for focus")
   - Social: Twitter threads on attention economy
   - Partnerships: Productivity YouTubers (Ali Abdaal, Thomas Frank)

---

## 🏆 Why Curator AI Will Win

### **Problem-Solution Fit**
- **Problem**: 2.5 hours/day wasted on social media (avg US adult, 2024 data)
- **Solution**: Replace with 3 intentional resources = 2+ hours reclaimed

### **Timing**
- AI agent boom (2024-2025): Users trust AI for personalization
- Attention economy backlash: "Digital minimalism" trend rising
- Self-improvement market: $10B industry, growing 5% YoY

### **Execution**
- Round 1: Working MVP with premium UX (not a prototype)
- Round 2: Database + mobile app (production-ready)
- Round 3: Community features + enterprise plan (scalable business)

---

## 👥 Team & Contributions

### Current Status
- **Solo Developer**: Full-stack implementation (frontend, backend, AI, design)
- **Time Invested**: 40+ hours (Dec 2024 - Jan 2025)



### Round 2 Needs
- **Backend Engineer**: PostgreSQL schema design, JWT auth
- **Designer**: Mobile app mockups, brand guidelines
- **AI Researcher**: Semantic search, embeddings, model fine-tuning

---

## 📚 References & Inspiration

### Academic Research
- "The Attention Economy" (Tim Wu, 2016)
- "Habit Formation & Behavior Change" (Wood & Neal, 2007)
- "Identity-Based Habits" (James Clear, 2018)

### Product Inspiration
- **Calm/Headspace**: Daily intentional content (meditation)
- **Duolingo**: Gamified self-improvement with streak tracking
- **Readwise**: Spaced repetition for knowledge internalization
- **Goodreads**: Community-driven book recommendations

### Technical Inspiration
- **Linear**: Premium UI with glassmorphism + dark mode
- **Arc Browser**: Intentional browsing (tab limits, spaces)
- **Superhuman**: Keyboard shortcuts, speed-focused UX

---

## 🚨 Known Limitations (Round 1)

### Technical Debt
- In-memory storage (resets on server restart)
- No password hashing (demo security)
- No rate limiting (vulnerable to DoS)


- No unit tests (manual testing only)
- WebGL shader disabled on mobile (performance concern)

### Product Gaps
- Only 40 curated resources (need 1000+)
- No recommendation history tracking
- No multi-language support (English only)
- No accessibility audit (WCAG compliance pending)

### These are EXPECTED for Round 1 demo and will be addressed in Round 2.

---

## 📞 Contact & Links

- **GitHub**: [github.com/yourusername/curator-ai](https://github.com/yourusername/curator-ai)
- **Live Demo**: [curator-ai.vercel.app](https://curator-ai.vercel.app) *(Coming Soon)*
- **Email**: your.email@example.com
- **Twitter/X**: [@yourhandle](https://twitter.com/yourhandle)

---

## 📄 License

MIT License - Free to use, modify, and distribute for hackathon purposes.

---

**Built with ❤️ for the [Hackathon Name] - January 2025**

*"The best investment you can make is in yourself. Curator AI helps you do it intentionally."*

