# Trivialities — Full-Stack Trivia Application

A complete, full-stack trivia platform featuring dynamic categorical gameplay sessions powered by the Open Trivia DB API, live authentication profiles, chronological user performance metric trends, and a real-time competitive global leaderboard.

## 🚀 Key Features

* **Open Trivia DB Integration:** Leverages the Open Trivia DB API to source public trivia pools, offering dynamic category, theme, and difficulty parameter filtering selectors.
* **Dynamic Trivia Engine:** Theme-based component color shifts that respond dynamically to the selected trivia category.
* **Modular Presentation Layout:** Highly optimized React architecture isolating display structures (`Navbar`, `GameSetup`, `QuestionCard`, `GameSummary`) from core state controller loops.
* **Secure Authentication Framework:** Robust session management driven by NextAuth credentials tokens with secure hashed user verification (`bcryptjs`).
* **Data Persistence Architecture:** Cloud-hosted database storage (MongoDB Atlas via Mongoose models tracking game sessions) using relational `.populate()` schemas.
* **Player Analytics Dashboard:** Side-by-side user view interface plotting pure CSS performance history charts, match logs, and top-10 global app standings.

## 🛠️ Tech Stack Built With

* **Frontend Frame:** Next.js (App Router), React, Tailwind CSS, TypeScript
* **State Management & Communication:** NextAuth.js, Axios, React Hot Toast
* **External APIs:** Open Trivia DB API (Trivia Question Source)
* **Backend Database Infrastructure:** Node.js, MongoDB Atlas, Mongoose ODM

## 📂 Architecture Mapping

```text
src/
├── components/           # Reusable Modular UI Layout Elements
│   ├── AuthProvider.tsx  # NextAuth Context Wrapper
│   ├── Navbar.tsx        # Modern Button Capsule Navigation Bar
│   ├── GameSetup.tsx     # Category Button Selection Card (Open Trivia DB categories)
│   ├── QuestionCard.tsx  # 2-Column Multiple-Choice Trivia Grid
│   └── GameSummary.tsx   # Dynamic Score Metrics Circle Ring
└── app/
    ├── page.tsx          # Master Game Engine State Loop Controller
    ├── auth/             # Interceptor Folder for Custom Login/Signup UI
    ├── dashboard/        # Performance History Graph & Standings Page
    └── api/              # Backend Serverless API Infrastructure Route Handlers
        ├── questions/    # Fetches, sanitizes, and formats pools from Open Trivia DB
        ├── auth/         # Token registration pipelines and security hashing
        └── user/         # Data aggregation handles (save-score & dashboard-stats)
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

## 🧪 Validation & Test Running

To execute the dual-layer data lifecycle schema checks and component state engine simulation tests, run:
```bash
npm test
```

To compile and verify a complete error-free production build version, run:
```bash
npm run build
```

## 🔮 Future Horizons (Phase 2 Roadmap)

* **Open Trivia DB Session Caching:** Implement session tokens from Open Trivia DB within the `/api/questions` route to prevent duplicate questions within a user's gameplay session.
* **SMTP Verification Gate (Nodemailer):** Fully integrate the pre-installed Nodemailer module into the `/api/auth/signup` pathway to send activation link tokens, securing the app against automated guest registrations.
* **Historical Data Overlays:** Expand the custom CSS bar graph to display categorical performance margins (e.g., tracking if a user scores higher in History vs. Science).
