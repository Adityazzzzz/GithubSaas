# System Design & Data Flow: GitBrain

This document details the database schema relationship, system components, and key data flows within GitBrain.

---

## 1. Database Schema Design (Prisma)

GitBrain utilizes a relational PostgreSQL database with `pgvector` extension for storing high-dimensional embeddings. Below is a simplified representation of the data models:

```mermaid
erDiagram
    User ||--o{ UserToProject : "member of"
    Project ||--o{ UserToProject : "has members"
    Project ||--o{ Commit : "contains"
    Project ||--o{ SourceCodeEmbedding : "has indexed files"
    Project ||--o{ ChatSession : "has chats"
    Project ||--o{ Meeting : "has meetings"
    Project ||--o{ Task : "has planning tasks"
    Project ||--o{ Sprint : "schedules planning"
    Project ||--o{ SubTeam : "segments members"
    
    Task }o--|| Sprint : "assigned to"
    Task }o--|| SubTeam : "allocated to"
    Task ||--o{ Comment : "has discussions"
    
    Meeting ||--o{ Issue : "generated issues"
    ChatSession ||--o{ Question : "contains Q&A history"
```

### Key Entities
* **Project**: The core tenant entity. Tracks metadata such as `githubUrl`, GitHub auth token reference, branch, indexing status, and soft deletion.
* **SourceCodeEmbedding**: Represents an indexed file. Stores the `fileName`, `summary`, raw `sourceCode`, and `summaryEmbedding` (type `Unsupported("vector(768)")`).
* **Task**: An issue/ticket in PM Studio. Holds properties for `title`, `description`, `status` (`TODO`, `IN_PROGRESS`, `DONE`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and timestamps.
* **Sprint**: Groups tasks into timeboxes with `startDate` and `endDate`.

---

## 2. Key Data Flow Diagrams

### A. Codebase Indexing Pipeline
When a user connects a GitHub repository, the system triggers a background indexing job:

```mermaid
sequenceDiagram
    participant User
    participant NextServer as Next.js Server
    participant GitHub as GitHub API
    participant Gemini as Gemini AI
    participant DB as PostgreSQL
    
    User->>NextServer: Connect Repository URL
    NextServer->>DB: Create Project (status = PENDING)
    NextServer-->>User: Return Project created successfully
    Note over NextServer: Background Job starts
    NextServer->>GitHub: Fetch files & branch metadata
    GitHub-->>NextServer: Return file contents
    loop For each file
        NextServer->>Gemini: Request summary & embedding vector
        Gemini-->>NextServer: Return 768d vector & summary
        NextServer->>DB: Save SourceCodeEmbedding
    end
    NextServer->>GitHub: Poll recent commits
    GitHub-->>NextServer: Return commit log
    NextServer->>DB: Save Commits log
    NextServer->>DB: Update Project Status to COMPLETED
```

---

### B. Codebase Q&A (RAG Search Flow)
When a user asks a question about their code:

```mermaid
sequenceDiagram
    participant Client
    participant API as tRPC Endpoint
    participant Gemini as Gemini AI
    participant DB as PostgreSQL
    
    Client->>API: Ask Question (text, sessionId)
    API->>Gemini: Generate Embedding vector for question
    Gemini-->>API: Return 768d search vector
    API->>DB: Query SourceCodeEmbedding (cosine similarity > 0.35)
    DB-->>API: Return top 5 matching code snippets
    API->>Gemini: Send prompt (Question + 5 Code snippets)
    Gemini-->>API: Return Markdown answer with file references
    API->>DB: Save Q&A pair to Question table
    API-->>Client: Stream Markdown response
```

---

### C. Meeting Upload & Issue Generation Flow
When a team uploads an audio meeting standup:

```mermaid
sequenceDiagram
    participant User
    participant Appwrite as Appwrite Storage
    participant API as Next.js API
    participant Assembly as AssemblyAI
    participant Gemini as Gemini AI
    participant DB as PostgreSQL
    
    User->>Appwrite: Upload audio file
    Appwrite-->>User: Return storage URL
    User->>API: Trigger meeting analysis (fileUrl)
    API->>DB: Create Meeting record (status = PROCESSING)
    API-->>User: Acknowledge processing started
    Note over API: Background transcription starts
    API->>Assembly: Submit audio URL for transcription
    Assembly-->>API: Return speaker turns and timestamped transcript
    API->>Gemini: Request action items, task breakdown & summary
    Gemini-->>API: Return meeting summary & structured issues
    API->>DB: Save Transcript & Summary to Meeting
    loop For each extracted issue
        API->>DB: Create Task (associated with project and active sprint)
    end
    API->>DB: Update Meeting Status to COMPLETED
```
