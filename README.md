# GitBrain AI & PM Studio

GitBrain is a unified AI-powered codebase intelligence platform and project management suite that turns repositories into active, queryable knowledge graphs.

It features two main environments:
*   **GitBrain AI Studio**: Chat with your codebase, search semantically, view code history, and transcribe video/audio meeting summaries.
*   **GitBrain PM Studio**: Manage sprints, Kanban boards, automate workflows, and organize sub-teams with local Loom recording and meeting scheduling.

---

## 🚀 Key Features

*   **Zero-Config Code RAG Search**: Indexes your repository and processes code summaries using Gemini AI and `pgvector` for similarity matching.
*   **AI Meeting Transcripts**: Processes audio recordings via AssemblyAI, creating automated sprint issue tickets.
*   **Interactive Kanban Board & Sprint Controller**: Track tasks, assign priorities, manage timelines, and configure automated task triggers.
*   **Segmented PM Analytics**: Automated metrics reporting on sprint velocity and task completion rates.
*   **Loom Video Status Recorder**: Record video updates directly in the browser with screen + camera overlays, backed by Appwrite persistent cloud storage.
*   **Sleek Modern UI**: Responsive design featuring high-fidelity dark modes, segmented transitions, and an ElevenLabs-style studio workspace switcher.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, `framer-motion`, `lucide-react`, Shadcn/ui.
*   **Backend & API**: tRPC (Type-safe API), Next.js API Routes.
*   **Database**: PostgreSQL with `pgvector` extension, Prisma ORM.
*   **Authentication**: Clerk Auth SDK.
*   **AI & Transcriptions**: Google Gemini AI (embeddings & generation), AssemblyAI (audio-to-text).
*   **Video Storage**: Appwrite Cloud Storage SDK.

---

## 📚 Technical Documentation

Explore the deep-dive technical design documents for GitBrain:

*   **[System Architecture](./docs/architecture.md)**: Workspace directory routing, client-side hooks sync (`useProject`), and layout design.
*   **[System Design & Data Flow](./docs/system-design.md)**: Prisma database models, sequence flows for codebase indexing, RAG, and meeting transcript processing.
*   **[Advanced Concepts](./docs/advanced-concepts.md)**: Cosine similarity mathematics, canvas composite Loom video recorder, and automations rules engine.

---

## ⚙️ Quick Start & Setup

### Prerequisites
1.  **Node.js** (v18.x or above) & **npm**.
2.  **PostgreSQL** instance with `pgvector` extension enabled.
3.  **Clerk Auth** accounts and API Keys.
4.  **Google Gemini AI** API Key.
5.  **AssemblyAI** token.
6.  **Appwrite Project ID & Bucket ID** (for video storage uploads).

### Installation

1.  Clone the repository and install dependencies:
    ```bash
    git clone https://github.com/Adityazzzz/GitBrain-AI-Studio.git
    cd GitBrainAi
    npm install
    ```

2.  Configure Environment Variables:
    Create a `.env` file in the root directory and define the required variables (see `.env.example` for details):
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/gitbrain?schema=public"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
    CLERK_SECRET_KEY="..."
    GEMINI_API_KEY="..."
    ASSEMBLYAI_API_KEY="..."
    NEXT_PUBLIC_APPWRITE_PROJECT_ID="..."
    NEXT_PUBLIC_APPWRITE_BUCKET_ID="..."
    ```

3.  Apply Database Migrations:
    ```bash
    npx prisma db push
    ```

4.  Start the Development Server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your browser.

---

## 📂 Directory Structure

```text
├── docs/                        # Deep-dive system documentation files
├── prisma/                      # Database schemas and migration configurations
├── public/                      # Static assets and media files
└── src/
    ├── app/                     # Next.js App Router Shell
    │   ├── (protected)/         # Authenticated layouts
    │   │   ├── [projectId]/     # Dynamic project name slug workspace routes
    │   │   │   ├── dashboard/   # AI Studio dashboard view
    │   │   │   ├── pmstudio/    # PM Studio tabs (Board, Sprints, Analytics)
    │   │   │   └── qa/          # Codebase chat session view
    │   │   └── layout.tsx       # Sidebar provider and app header shell
    │   ├── api/                 # Next.js API routing (processing services)
    │   └── page.tsx             # Landing entry page
    ├── components/              # Global UI elements (search, star tracker)
    ├── hooks/                   # Custom Hooks (useProject active context)
    ├── lib/                     # Vector helpers, GitHub integrations, API loaders
    ├── server/                  # tRPC routers and API endpoints
    └── trpc/                    # tRPC client declarations
```

---

## 📄 License

This project is licensed under the MIT License.