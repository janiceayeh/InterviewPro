# InterviewPro

A full-stack interview preparation platform built with Next.js. Students can practise mock interviews, get AI-powered coaching and evaluation, browse interview tips, and engage in a community forum. Admins manage content, users, and forum moderation through a dedicated CMS dashboard.

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16 (App Router) + React 18   |
| Language   | TypeScript                           |
| Styling    | Tailwind CSS + shadcn/ui (Radix UI)  |
| Database   | Firebase Firestore                   |
| Auth       | Firebase Authentication              |
| AI / LLM   | Anthropic Claude (via Vercel AI SDK) |
| Charts     | Recharts                             |
| Animations | Framer Motion                        |
| Testing    | Jest + React Testing Library         |

## Features

**Student**

- Mock interviews by category with timed questions
- AI Copilot — real-time interview coaching powered by Claude
- AI evaluation and scoring of completed sessions
- Interview history and progress tracking
- Interview tips resource library
- Community forum — create posts, reply, and engage

**Admin / CMS**

- Dashboard with user and completion analytics
- Interview question management
- Tips / resource management
- User management
- Forum moderation (posts and answers)

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (Firestore + Authentication enabled)
- An Anthropic API key

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT=

# CMS Admin (server)
ADMIN_USERS=

# Anthropic
AI_GATEWAY_API_KEY=
```

### Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

Deployed app available at `https://interview-pro-6daq.vercel.app`

If you need access to the cloud firestore send me an email at: aa1382@student.le.ac.uk

### Other Scripts

```bash
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint
npm test             # Run tests
npm run test:watch   # Watch mode
npm run test:coverage  # Coverage report
```

## Project Structure

```
src/
├── app/
│   ├── (student)/
│   │   ├── (auth)/          # Login, signup, password reset, role selection
│   │   └── (dashboard)/     # Mock interviews, copilot, forum, tips, profile
│   ├── (admin)/
│   │   ├── (auth)/          # Admin login / password reset
│   │   └── (cms)/           # Admin dashboard, users, questions, tips, forum moderation
│   └── api/                 # API routes (copilot, evaluation, analytics, users)
├── components/              # Shared UI components
├── context/                 # Auth context (student + admin)
├── lib/                     # Firebase, utility helpers
└── types/                   # TypeScript type definitions
```
