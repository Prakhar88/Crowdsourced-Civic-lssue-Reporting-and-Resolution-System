# 🏙️ CivicSense — Crowdsourced Civic Issue Reporting & Resolution System

![CivicSense Banner](https://img.shields.io/badge/CivicSense-v1.0.0-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange?style=flat-square&logo=firebase)
![Supabase](https://img.shields.io/badge/Supabase-Storage-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)

A full-stack civic engagement platform that empowers citizens to report local issues, enables field workers to resolve them, and gives administrators complete oversight — all powered by AI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Portals](#portals)
- [AI Integration](#ai-integration)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firestore Schema](#firestore-schema)
- [Deployment](#deployment)
- [User Flows](#user-flows)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## 🌟 Overview

CivicSense is a **3-portal civic management system** that bridges the gap between citizens and local government. Citizens report issues like potholes, garbage, and broken streetlights. AI automatically classifies and prioritizes them. Admins assign tasks to field workers. Workers resolve issues on the ground. Everyone can track progress in real time.

---

## ✨ Features

### 🧑‍💼 Admin Portal
- Real-time dashboard with 8 live data cards
- Reports map with color-coded status pins
- AI-powered issue classification and priority scoring
- Smart auto-assignment of workers based on proximity
- Worker management — add, view, and manage field workers
- Department performance analytics
- Duplicate report detection

### 👷 Worker Portal
- Real-time task list filtered to the logged-in worker
- Map view of all assigned tasks with Google Maps navigation
- One-tap task status updates (Assigned → In Progress → Done)
- Before/after photo capture for proof of resolution
- Availability toggle for shift management

### 👥 Citizen Portal
- Public landing page with live city stats
- 3-step issue reporting wizard (photo + GPS + details)
- Anonymous or Google-authenticated submissions
- Real-time report tracking with status timeline
- Points system and community leaderboard
- Gamification badges for civic engagement

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Firebase Firestore (real-time) |
| Storage | Supabase Storage (images) |
| AI | Google Gemini 1.5 Flash |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| API Routes | Vercel Serverless Functions |
| Hosting | Vercel |
| State | React Context + Custom Hooks |
| Icons | Lucide React + React Icons |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   VERCEL HOSTING                │
│                                                 │
│   /citizen/*     /dashboard/*    /worker/*      │
│   Citizen        Admin           Worker         │
│   Portal         Portal          Portal         │
│                                                 │
│   ┌─────────────────────────────────────────┐  │
│   │           Vercel API Routes             │  │
│   │  /api/analyze-report  (Gemini AI)       │  │
│   │  /api/auto-assign     (Worker matching) │  │
│   │  /api/check-duplicate (Geo clustering)  │  │
│   └─────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼──────┐    ┌────────▼────────┐
│   Firebase   │    │    Supabase     │
│              │    │                 │
│ • Auth       │    │ • Storage       │
│ • Firestore  │    │   civic-reports │
│   (realtime) │    │   bucket        │
└──────────────┘    └─────────────────┘
```

---

## 🖥️ Portals

### Citizen Portal — `/citizen`
The public-facing side. No login required to browse. Google Sign In to track your own reports.

| Page | Route | Auth Required |
|------|-------|--------------|
| Home | `/citizen` | No |
| Report Issue | `/citizen/report` | No (anonymous allowed) |
| My Reports | `/citizen/my-reports` | Yes (Google) |
| Leaderboard | `/citizen/leaderboard` | No |

### Admin Portal — `/dashboard`
Restricted to registered admins. First Google login auto-creates admin profile.

| Page | Route |
|------|-------|
| Dashboard | `/dashboard` |
| Reports | `/reports` |
| Analytics | `/analytics` |
| Workers | `/workers` |
| Community | `/community` |
| Maintenance | `/maintenance` |

### Worker Portal — `/worker`
Restricted to workers registered by an admin.

| Page | Route |
|------|-------|
| My Tasks | `/worker/dashboard` |
| Map View | `/worker/map` |
| Profile | `/worker/profile` |

---

## 🤖 AI Integration

CivicSense uses **Google Gemini 1.5 Flash** via Vercel API Routes for three intelligent features:

### 1. Report Analysis (`/api/analyze-report`)
Triggered after every citizen submission. Analyzes the uploaded photo and description to return:
- **Category** — pothole, garbage, streetlight, flooding, vandalism, other
- **Priority** — low, medium, high, critical
- **Confidence score** — 0.0 to 1.0
- **Summary** — one-line human readable description
- **Suggested action** — what the field worker should do

### 2. Smart Worker Assignment (`/api/auto-assign`)
Uses the **Haversine formula** to calculate distances between the report location and all available workers, then assigns the nearest available worker automatically.

### 3. Duplicate Detection (`/api/check-duplicate`)
Checks for existing open reports within a **100-meter radius** with the same category. Marks duplicates automatically to prevent redundant work assignments.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (Spark or Blaze plan)
- Supabase project
- Google AI Studio API key (free)
- Vercel account (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/Parthverma2409/Crowdsourced-Civic-lssue-Reporting-and-Resolution-System.git
cd Crowdsourced-Civic-lssue-Reporting-and-Resolution-System

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your keys (see Environment Variables section)

# Start development server
npm run dev
```

### First-Time Setup

1. **Firebase Console** → Create Firestore Database (test mode) → Enable Google Auth
2. **Supabase** → Create project → Storage → New bucket named `civic-reports` (public)
3. **Google AI Studio** → Get API key → paste into `.env.local`
4. Run the app → go to `/login` → select Admin → sign in with Google
5. Your admin profile is auto-created in Firestore

---

## 🔑 Environment Variables

Create a `.env.local` file at the project root:

```env
# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id

# Supabase (VITE_ prefix = accessible in frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI (server-side only, no VITE_ prefix)
GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ Never commit `.env.local` to git. It's already in `.gitignore`.

---

## 🗄️ Firestore Schema

```
admins/{uid}
  └── name, email, photoURL, role:"admin", createdAt

workers/{uid}
  └── name, email, phone, zone, isAvailable,
      location:{lat,lng}, assignedTasks[], 
      completedTasks[], createdAt

users/{uid}
  └── name, email, photoURL, role:"user",
      points, createdAt, lastLogin

reports/{reportId}
  └── title, description, category, imageURL,
      location:{lat, lng, address},
      submittedBy, submitterName,
      status, assignedTo, assignedTask,
      duplicateOf, aiCategory, aiPriority,
      aiConfidence, aiSummary, aiSuggestedAction,
      aiStatus, createdAt, updatedAt

tasks/{taskId}
  └── reportId, assignedTo, assignedBy,
      status, beforeImageURL, afterImageURL,
      notes, createdAt, resolvedAt

notifications/{notifId}
  └── targetId, targetRole, message,
      taskId|reportId, read, createdAt

alerts/{alertId}
  └── reportId, priority:"critical",
      summary, createdAt
```

---

## 🚢 Deployment

### Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

After deployment:

1. **Vercel Dashboard** → Settings → Environment Variables → add all 6 keys from `.env.local`
2. **Firebase Console** → Authentication → Settings → Authorized Domains → add your `your-app.vercel.app` URL
3. Redeploy: `vercel --prod`

### Firebase Security Rules

Paste these in **Firebase Console → Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    match /workers/{userId} {
      allow read: if request.auth != null 
        && request.auth.uid == userId;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    match /notifications/{notifId} {
      allow read, write: if request.auth != null;
    }
    match /alerts/{alertId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🔄 User Flows

### Citizen Reports an Issue
```
Visits /citizen → clicks "Report an Issue"
→ Uploads photo → sets GPS location → fills details
→ Submits → image saved to Supabase
→ Report doc created in Firestore
→ Gemini AI analyzes photo → adds category + priority
→ Duplicate check runs automatically
→ Citizen gets report ID + can track at /citizen/my-reports
```

### Admin Resolves a Report
```
Logs in as Admin → /dashboard shows new pending report
→ Goes to /reports → sees AI priority badge
→ Clicks "Auto-Assign" → nearest worker assigned
→ Worker gets notification
→ Admin tracks progress in real-time dashboard
```

### Worker Completes a Task
```
Logs in as Worker → /worker/dashboard shows assigned tasks
→ Clicks "Start Task" → status: in_progress
→ Travels to location (map view with navigation)
→ Fixes the issue → clicks "Mark Complete"
→ Uploads after photo → status: resolved
→ Citizen sees "Resolved ✓" on their report in real-time
→ Citizen earns points → appears on leaderboard
```

---

## 📁 Project Structure

```
├── api/                          # Vercel serverless functions
│   ├── analyze-report.js         # Gemini AI image analysis
│   ├── auto-assign.js            # Smart worker assignment
│   └── check-duplicate.js        # Geo duplicate detection
├── public/                       # Static assets
└── src/
    ├── components/               # Shared UI components
    │   ├── CivicLogo.jsx
    │   ├── Navbar.jsx
    │   ├── ReportCard.jsx
    │   └── Sidebar.jsx
    ├── context/
    │   └── AuthContext.jsx       # Auth state + role detection
    ├── hooks/                    # Firebase data hooks
    │   ├── useReports.js         # Reports CRUD + stats
    │   ├── useUserReports.js     # Citizen-specific reports
    │   ├── useWorkers.js         # Worker management
    │   └── useWorkerTasks.js     # Worker task management
    ├── pages/
    │   ├── cards/                # 8 admin dashboard cards
    │   ├── citizen/              # Citizen portal pages
    │   ├── worker/               # Worker portal pages
    │   ├── Dashboard.jsx         # Admin dashboard
    │   ├── Login.jsx             # Unified role-based login
    │   ├── Reports.jsx           # Admin reports view
    │   ├── Analytics.jsx
    │   ├── Workers.jsx
    │   ├── Community.jsx
    │   └── Maintenance.jsx
    ├── services/
    │   ├── firebaseConfig.js     # Firebase init + exports
    │   └── supabaseConfig.js     # Supabase client
    ├── utils/
    │   ├── uploadImage.js        # Supabase image upload
    │   └── seedFirestore.js      # Dev data seeding
    ├── App.jsx                   # Routes + ProtectedRoute
    └── main.jsx
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Parth Verma**

Built with ❤️ for smarter, more responsive cities.

---

> 💡 **Tip for first-time setup:** After deployment, go to `/login`, select **Admin**, and sign in with Google. Your admin account is created automatically on first login — no manual Firestore setup needed!
