# Trivialities — Full-Stack Trivia Application

A complete, full-stack trivia platform featuring dynamic categorical gameplay sessions, live authentication profiles, chronological user performance metric trends, and a real-time competitive global leaderboard.

### 🌐 Live Production Deployment
The application is fully deployed and operational at: **[https://trivialities-trivia-app.onrender.com](https://trivialities-trivia-app.onrender.com)**

### 📂 Planning Documentation Links
Original concept sheets and structural architecture maps are saved directly inside the repo:
* **[Project Ideas](./docs/project-ideas.md)**
* **[Project Proposal](./docs/project-proposal.md)**
* **[Control Flow Diagrams](./docs/control-flow.md)**
* **[Data Model Specifications](./docs/data-model.md)**

## 🚀 Key Features
* **Open Trivia DB Integration:** Sources all question pools dynamically from the **[Open Trivia Database API](https://opentdb.com)**, an open-source, user-contributed trivia engine. The app integrates directly with OpenTDB endpoints using category ID references (e.g., Category 9 for General Knowledge) and strictly filters parameter mappings across easy, medium, and hard difficulty states.
* **Dynamic Trivia Engine:** Theme-based component color shifts that respond dynamically to the selected trivia category.
* **Modular Presentation Layout:** Highly optimized React architecture isolating display structures (`Navbar`, `GameSetup`, `QuestionCard`, `GameSummary`) from core state controller loops.
* **Secure Authentication Framework:** Robust session management driven by NextAuth credentials tokens with strict server-side environment checks and secure hashed user verification (`bcryptjs`).
* **Data Persistence Architecture:** Cloud-hosted database storage (MongoDB Atlas via Mongoose models tracking game sessions) using relational `.populate()` schemas.
* **Player Analytics Dashboard:** Side-by-side user view interface plotting pure CSS performance history charts, match logs, and top-10 global app standings.

## 🛠️ Tech Stack Built With

* **Frontend Frame:** Next.js (App Router), React, Tailwind CSS, TypeScript
* **State Management & Communication:** NextAuth.js, Axios, React Hot Toast
* **External APIs:** Open Trivia DB API (Trivia Question Source)
* **Backend Database Infrastructure:** Node.js, MongoDB Atlas, Mongoose ODM
* **Testing Infrastructure:** Jest, Playwright, MongoDB Memory Server

## 🔒 Security Posture & Code Auditing

Following a comprehensive code review, this application was hardened against critical full-stack vulnerabilities:
* **XSS Mitigation:** Completely purged `dangerouslySetInnerHTML` from the frontend layer. Replaced it with a secure, native browser `DOMParser` configuration inside client components to safely decode complex API HTML entities.
* **Fail-Fast Environment Security:** Patched the `NextAuth` initialization pipelines to strip out insecure fallback strings. The application now deliberately crashes loudly during build or initialization phases if `NEXTAUTH_SECRET` is omitted, eliminating silent vulnerabilities in production.
* **Attack Surface Reduction:** Eradicated redundant, dead-code login API folders to enforce unified authentication handling exclusively through the NextAuth engine layer.
* **Data Layer Defenses:** Hardened Mongoose schema filters with strict regex email validation engines and logical score boundary circuit breakers (`min: 0`) to prevent API parameter tampering.

## 📂 Architecture Mapping

```text
├── src/
│   ├── components/       # Reusable Modular UI Layout Elements
│   │   ├── AuthProvider.tsx  # NextAuth Context Wrapper
│   │   ├── Navbar.tsx        # Modern Button Capsule Navigation Bar
│   │   ├── GameSetup.tsx     # Category Button Selection Card (Open Trivia DB categories)
│   │   ├── QuestionCard.tsx  # Secure, Cross-Site Scripting (XSS) Protected Quiz Card
│   │   └── GameSummary.tsx   # Dynamic Score Metrics Circle Ring
│   └── app/
│       ├── page.tsx          # Master Game Engine State Loop Controller
│       ├── auth/             # Interceptor Folder for Custom Login/Signup UI
│       ├── test-component/   # Isolated E2E testing sandbox route configuration
│       ├── dashboard/        # Performance History Graph & Standings Page
│       └── api/              # Backend Serverless API Infrastructure Route Handlers
│           ├── questions/    # Fetches, sanitizes, and formats pools from Open Trivia DB
│           ├── auth/         # Token registration pipelines and security hashing
│           └── user/         # Data aggregation handles (save-score & dashboard-stats)
└── tests/                    # Independent Integration & Unit Testing Layer
```

## ⚙️ Local Configuration & Installation

Follow these steps to deploy this repository project on your local machine:

1. Clone or extract the project directory workspace.
2. Install the necessary project packages using the legacy peer-dependency flag:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Create a `.env.local` configuration file inside your project's root folder and add the following context lines:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   NEXTAUTH_SECRET=generate_any_secure_secret_hash_string
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Boot up the local Next.js environment server:
   ```bash
   npm run dev
   ```
5. Open your web browser navigation viewport and head to: `http://localhost:3000`

## 🧪 Verification & Test Running

The application utilizes a professional, isolated test architecture splitting fast server-side logic validation from real-world user interface interaction checks.

### 1. Integration & Backend Model Testing (Jest)
Monitors core data integrity, schema validation, relationship properties, and registration API handlers using an isolated in-memory MongoDB environment server. No running database instance is required.
```bash
# Execute all 19 server-side test blocks sequentially
npm test
```

### 2. End-to-End Frontend Testing (Playwright)
Validates UI rendering, safe character entity decoding, button selection freezing, and active component state transitions inside real browser contexts (Chromium, Firefox, WebKit).
```bash
# Ensure your Next.js local server is active in another tab (npm run dev)
npx playwright test
```

To compile and verify a complete error-free production build version, run:
```bash
npm run build
```

## 🔮 Future Horizons (Phase 2 Roadmap)

* **Open Trivia DB Session Caching:** Implement session tokens from Open Trivia DB within the `/api/questions` route to prevent duplicate questions within a user's gameplay session.
* **SMTP Verification Gate (Nodemailer):** Fully integrate the pre-installed Nodemailer module into the `/api/auth/signup` pathway to send activation link tokens, securing the app against automated guest registrations.
* **Historical Data Overlays:** Expand the custom CSS bar graph to display categorical performance margins (e.g., tracking if a user scores higher in History vs. Science).
