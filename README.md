# GeminiVault — Personal AI Memory

> **Tagline:** Think with Gemini. Remember privately. Act intelligently.

GeminiVault is a secure, authenticated personal AI journal and memory vault built on **Google AI Studio (Gemini 2.5 Flash)** and **Google Cloud / Firebase**. It enables users to have multi-turn reflective conversations, auto-generate structured summaries with key takeaways and action items, synthesize personal long-term insights (recurring topics, goals, blockers), and query their historical reflections with grounded date citations.

---

## 🔒 Security Architecture: Zero-Leakage Threat Model

GeminiVault implements a defense-in-depth security model:

```
[ User Client (SPA) ]
        │  1. Authenticate with Google / Email
        ▼
[ Firebase Auth ] ──► Emits Cryptographically Signed RS256 ID Token
        │
        ├──► 2. Direct Firestore SDK Access (Strict Security Rules)
        │       └─► match /users/{userId} where request.auth.uid == userId
        │
        ▼  3. Bearer Token in Authorization Header
[ Server-Side Proxy (Express API) ]
        │  4. Token Verification (Extracts caller UID from token claims)
        │  5. Input Validation & Quota Guardrails (Zod schema)
        │  6. Prompt Injection Boundary Enforcement
        ▼
[ Gemini 2.5 API ] ◄── GEMINI_API_KEY (Stored exclusively in server memory)
```

### Core Security Guarantees

1. **Zero Client-Side AI Secrets:** `GEMINI_API_KEY` is loaded strictly in the backend Node.js runtime (`server.ts`). It is never bundled into client JavaScript, never sent to the browser, and never exposed in client headers.
2. **Zero Cross-User Data Leakage (Anti-IDOR):**
   - User identity is bound solely to `request.auth.uid` in Firestore Security Rules.
   - Client requests cannot spoof another user's ID; the server binds identity directly from verified Firebase token claims (`req.user.uid`).
3. **Least-Privilege Firestore Rules:**
   - All collections are path-nested under `/users/{userId}/` or require `resource.data.ownerUid == request.auth.uid`.
   - Wildcard unauthenticated access is rejected unconditionally.
4. **Prompt Injection Guardrails:**
   - User messages and retrieved memories are treated strictly as untrusted text within dedicated XML/markdown boundaries.
   - Non-overridable system directives command Gemini to ignore attempts to reveal keys, modify directives, or simulate privilege escalation.

---

## ⚡ 100% Free-Tier Architecture (No Payment Method Required)

GeminiVault is engineered to operate entirely within free quotas without ever entering a credit card:

| Component | Free-Tier Allowance | Usage in GeminiVault |
|---|---|---|
| **Firebase Spark Plan** | Free forever, no billing account | Authentication + Firestore + Free Hosting |
| **Cloud Firestore** | 1GB storage, 50,000 reads/day, 20,000 writes/day | UID-isolated documents and subcollections |
| **Google Gemini API** | Google AI Studio free tier | Multi-turn chat, summaries, grounded memory search |
| **Node.js Server** | Container runtime | Express proxy on port 3000 |

---

## 📂 Project Structure

```
├── .env.example               # Declared environment variables for AI Studio
├── .env.local.example         # Template for local dev configuration
├── .firebaserc                # Firebase project identifier
├── firebase.json              # Firebase Hosting & Firestore configuration
├── firestore.rules            # User-isolated Firestore security rules
├── metadata.json              # Platform metadata & permissions
├── package.json               # Dependencies & build scripts
├── server.ts                  # Express server entry point (Gemini proxy & Auth)
├── tsconfig.json              # TypeScript compilation configuration
├── vite.config.ts             # Vite frontend bundler configuration
└── src/
    ├── App.tsx                # Main router & auth coordinator
    ├── main.tsx               # Client React DOM entry point
    ├── index.css              # Tailwind CSS styles
    ├── types/                 # TypeScript interfaces (Conversation, Message, etc.)
    ├── lib/
    │   └── firebase.ts        # Client Firebase SDK initialization
    ├── services/
    │   ├── api-client.ts      # Authenticated HTTP client (attaches Bearer token)
    │   ├── conversation-service.ts  # Firestore conversation & message operations
    │   ├── summary-service.ts       # Firestore structured summary operations
    │   └── insight-service.ts       # Firestore insight operations
    ├── server/
    │   ├── auth-verify.ts     # Firebase token verification middleware
    │   ├── gemini.ts          # Server-side @google/genai caller & prompts
    │   └── validation.ts      # Zod request validation schemas
    └── components/
        ├── Navbar.tsx         # Navigation header & theme switcher
        ├── LandingPage.tsx    # Unauthenticated landing page
        ├── AuthModal.tsx      # Google & Email auth modal
        ├── Dashboard.tsx      # Metrics, quick actions, recent journals
        ├── JournalChat.tsx    # Multi-turn conversation UI & summarizer
        ├── SummaryModal.tsx   # Structured memory preview
        ├── InsightEngine.tsx  # Personal pattern synthesis engine
        ├── AskMyPast.tsx      # Grounded memory search with date citations
        ├── SecurityCenter.tsx # Architecture diagram & live test suite
        └── DeleteDataModal.tsx# Permanent privacy data erasure
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 20+
- A Google AI Studio Gemini API key (`GEMINI_API_KEY`)
- A Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy the environment template:
```bash
cp .env.local.example .env.local
```

3. Configure your keys in `.env.local`:
```env
GEMINI_API_KEY="your_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

4. Run the development server (Express + Vite on port 3000):
```bash
npm run dev
```

5. Open your browser at:
```
http://localhost:3000
```

---

## 🚀 Firebase Hosting & Rules Deployment

To deploy Firestore security rules and client hosting:

1. Log in to Firebase CLI:
```bash
npx firebase-tools login
```

2. Deploy Firestore security rules:
```bash
npx firebase-tools deploy --only firestore:rules
```

3. Build and deploy frontend to Firebase Hosting:
```bash
npm run build
npx firebase-tools deploy --only hosting
```

---

## 📡 API Endpoints

All Gemini endpoints require an `Authorization: Bearer <firebase_id_token>` header.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and Gemini configuration status |
| `POST` | `/api/chat` | Multi-turn reflective conversation with Gemini |
| `POST` | `/api/summarize` | Structured summary extraction (title, key points, goals, action items) |
| `POST` | `/api/insights/generate` | Synthesizes recurring topics, blockers, and next steps |
| `POST` | `/api/ask` | Grounded memory query with citation extraction |
| `POST` | `/api/security/test` | Live automated security audit suite |

---

## 🧪 Security Checklist & Verification

- [x] Zero client-side Gemini secrets (verified by `SecurityCenter` live audit)
- [x] Strict user isolation in Firestore security rules (`/users/{userId}`)
- [x] Cryptographic verification of Firebase ID tokens on all server routes
- [x] Payload size limits and Zod schema validation
- [x] Prompt injection separation boundaries
- [x] Explicit user privacy erasure ("Delete My Data" with confirmation)
- [x] 100% Free-Tier Spark / No-payment-method architecture
