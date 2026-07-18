import os
import time
import psycopg2
import google.generativeai as genai
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
api_key = os.getenv("GEMINI_API_KEY")

if not db_url or not api_key:
    raise ValueError("DATABASE_URL or GEMINI_API_KEY not set.")

genai.configure(api_key=api_key)

print("[CONN] Connecting to Neon PostgreSQL...")
conn = psycopg2.connect(db_url)
cursor = conn.cursor()

# Mock dataset of 30 files and corresponding semantic queries
mock_data = [
    {
        "file": "src/lib/auth.ts",
        "summary": "Handles JWT authentication, token signing, session validation, and password hashing.",
        "query": "Where do we verify user session tokens and validate JWTs?"
    },
    {
        "file": "src/components/Sidebar.tsx",
        "summary": "Renders the main navigation links, workspace switcher, and collapsed sidebar state.",
        "query": "Find the component that displays the sidebar layout and workspace lists."
    },
    {
        "file": "src/server/db.ts",
        "summary": "Initializes and exports the database client connection pool using Prisma.",
        "query": "Where is the main Prisma client connection pool configured?"
    },
    {
        "file": "src/hooks/useProject.ts",
        "summary": "Custom React hook that retrieves and syncs the active project CUID slug from the URL.",
        "query": "Which React hook resolves the active project name from the address path?"
    },
    {
        "file": "src/app/api/webhook/razorpay/route.ts",
        "summary": "Listens for webhook payment success notifications from Razorpay and updates status.",
        "query": "Where is the callback endpoint for Razorpay payment webhooks?"
    },
    {
        "file": "src/components/ui/dialog.tsx",
        "summary": "Tailwind-styled overlay modal component using radix-ui primitives.",
        "query": "Find the modal sheet or dialog box ui component."
    },
    {
        "file": "src/app/billing/page.tsx",
        "summary": "Renders the pricing options, payment tier selections, and payment history.",
        "query": "Where is the UI page showing current pricing plans?"
    },
    {
        "file": "src/lib/assembly.ts",
        "summary": "Client wrapper for AssemblyAI audio transcription API, sending voice recordings.",
        "query": "Which file handles sending audio records for speech-to-text translation?"
    },
    {
        "file": "src/app/api/process-meeting/route.ts",
        "summary": "Webhook receiver that processes AssemblyAI audio output to generate sprint tasks.",
        "query": "Where do we parse standup transcription files into Kanban tickets?"
    },
    {
        "file": "src/components/KanbanBoard.tsx",
        "summary": "Renders the drag-and-drop task column board driven by sub-teams.",
        "query": "Find the visual task board with drag-and-drop card columns."
    },
    {
        "file": "src/lib/gemini.ts",
        "summary": "Generates code summaries, embeddings, and chat completions using Google Gemini.",
        "query": "Where do we invoke Gemini generative models and embed content?"
    },
    {
        "file": "src/app/api/github/webhook/route.ts",
        "summary": "Listens to GitHub push events to trigger incremental repository sync and re-indexing.",
        "query": "Where do we process GitHub push webhooks for code updates?"
    },
    {
        "file": "src/lib/github-loader.ts",
        "summary": "Downloads repository file trees, parses diffs, and classifies modified code paths.",
        "query": "Find the code that crawls file trees and classifies repository differences."
    },
    {
        "file": "src/app/qa/page.tsx",
        "summary": "Renders the AI developer studio page allowing codebase semantic questions.",
        "query": "Where is the chat interface page for semantic codebase Q&A?"
    },
    {
        "file": "src/server/api/routers/project.ts",
        "summary": "tRPC router declaring endpoints for project creation, sync, and member updates.",
        "query": "Where are the tRPC routes for repository syncing defined?"
    },
    {
        "file": "src/components/LoomRecorder.tsx",
        "summary": "Controls video capture, camera bubble overlay clipping, and client WebM encoding.",
        "query": "Find the component that handles webcam recording and browser compositing."
    },
    {
        "file": "src/app/meetings/page.tsx",
        "summary": "Renders the list of transcribed standup audio files, summaries, and Loom videos.",
        "query": "Where do we display the list of past voice transcripts?"
    },
    {
        "file": "src/components/ui/accordion.tsx",
        "summary": "Sleek collapsible item panels driven by Radix Accordion primitives.",
        "query": "Where is the Accordion ui styling component?"
    },
    {
        "file": "src/lib/appwrite.ts",
        "summary": "Initializes Appwrite SDK client to store recorded WebM files in cloud buckets.",
        "query": "Find the storage config file for uploading recorded WebM files."
    },
    {
        "file": "src/app/api/auth/webhook/route.ts",
        "summary": "Listens to Clerk webhook events to sync user registrations with the database.",
        "query": "Where is the webhook receiver for Clerk user account syncs?"
    },
    {
        "file": "src/components/ui/alert-dialog.tsx",
        "summary": "Radix-ui based confirmation dialog component for blocking alerts.",
        "query": "Find the styling for confirmation alert modals."
    },
    {
        "file": "src/components/ui/aspect-ratio.tsx",
        "summary": "Utility container to fix responsive dimensions for image/video renders.",
        "query": "Where is the aspect ratio visual utility wrapper?"
    },
    {
        "file": "src/components/ui/menubar.tsx",
        "summary": "Radix-ui base menubar for styling header dropdown menus.",
        "query": "Find the styling component for main header menus."
    },
    {
        "file": "src/components/ui/breadcrumb.tsx",
        "summary": "Navigational link list displaying active path location breadcrumbs.",
        "query": "Where do we define the breadcrumb path link styles?"
    },
    {
        "file": "src/components/ui/alert.tsx",
        "summary": "Callout banner alert panels for displaying critical warnings.",
        "query": "Find the styling layout for caution callout panels."
    },
    {
        "file": "src/components/ui/avatar.tsx",
        "summary": "Circular user profile image placeholder component with fallback initials.",
        "query": "Find the profile image rendering widget with name fallbacks."
    },
    {
        "file": "src/components/ui/calendar.tsx",
        "summary": "Premium date picker select panel built using react-day-picker.",
        "query": "Find the calendar component showing active date cells."
    },
    {
        "file": "src/components/ui/button.tsx",
        "summary": "Primary button component supporting outline, link, and hover effects.",
        "query": "Where are button component variants and styles defined?"
    },
    {
        "file": "src/components/ui/card.tsx",
        "summary": "Flexible bordered boxes for dashboard panels and structured widgets.",
        "query": "Find the general bordered card or panel layout styling."
    },
    {
        "file": "src/components/ui/chart.tsx",
        "summary": "Visual bar/line charts wrapper using Recharts graphing primitives.",
        "query": "Where do we configure chart graph layouts and colors?"
    }
]

def get_embedding(text):
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        output_dimensionality=768
    )
    return result['embedding']

def run():
    print("[TEST] Starting Automated RAG Retrieval Relevance Test (30-Query Evaluation)...")
    
    # 1. Create a mock project
    project_id = "mock_rag_accuracy_project"
    cursor.execute(
        'INSERT INTO "Project" (id, name, "githubUrl", branch, "updatedAt") VALUES (%s, %s, %s, %s, NOW()) ON CONFLICT (id) DO NOTHING',
        (project_id, "MOCK_RAG_ACCURACY", "https://github.com/mock/mock", "main")
    )
    conn.commit()
    print(f"[INFO] Mock Project Created: {project_id}")

    # 2. Seed mock files and generate embeddings using the gemini-embedding-001 model
    print("[SEED] Generating embeddings for 30 mock codebase files...")
    cursor.execute('DELETE FROM "SourceCodeEmbedding" WHERE "projectId" = %s', (project_id,))
    conn.commit()
    
    seed_rows = []
    for idx, item in enumerate(mock_data):
        file_name = item["file"]
        summary = item["summary"]
        
        print(f"  - Embedding file {idx + 1}/30: {file_name}...")
        emb = get_embedding(summary)
        vec_str = f"[{','.join(map(str, emb))}]"
        
        row_id = f"mock_rag_py_{idx}"
        cursor.execute(
            'INSERT INTO "SourceCodeEmbedding" (id, "projectId", "fileName", "summary", "sourceCode") VALUES (%s, %s, %s, %s, %s) RETURNING id',
            (row_id, project_id, file_name, summary, "export const code = () => {}")
        )
        cursor.execute(
            'UPDATE "SourceCodeEmbedding" SET "summaryEmbedding" = %s::vector WHERE "id" = %s',
            (vec_str, row_id)
        )
        time.sleep(0.8) # Avoid API rate limit
        
    conn.commit()
    print("[OK] Seeding and embedding computation complete.")

    # 3. Evaluate retrieval queries
    print("\n[RUN] Executing 30 semantic evaluation queries...")
    hits = 0
    failures = []
    
    for idx, item in enumerate(mock_data):
        query_text = item["query"]
        expected_file = item["file"]
        
        emb = get_embedding(query_text)
        vec_str = f"[{','.join(map(str, emb))}]"
        
        sql_query = f"""
            SELECT "fileName",
                   1 - ("summaryEmbedding" <=> '{vec_str}'::vector) AS similarity
            FROM "SourceCodeEmbedding"
            WHERE "projectId" = '{project_id}' AND 1 - ("summaryEmbedding" <=> '{vec_str}'::vector) > 0.1
            ORDER BY similarity DESC
            LIMIT 5
        """
        cursor.execute(sql_query)
        matches = cursor.fetchall()
        
        found = False
        top_rank = -1
        for rank, m in enumerate(matches):
            if m[0] == expected_file:
                found = True
                top_rank = rank + 1
                break
                
        if found:
            hits += 1
            print(f"  [{idx + 1}/30] PASS (Rank {top_rank}) - Query: \"{query_text[:40]}...\"")
        else:
            failures.append((query_text, expected_file, [m[0] for m in matches]))
            print(f"  [{idx + 1}/30] FAIL - Query: \"{query_text[:40]}...\" (Expected: {expected_file})")
            
        time.sleep(0.8) # Avoid API rate limit

    accuracy = (hits / len(mock_data)) * 100
    print("\n[RESULT] RAG ACCURACY EVALUATION RESULTS:")
    print(f"- Total Queries Evaluated: 30")
    print(f"- Successful Matches (Top-5): {hits} / 30")
    print(f"- Measured Accuracy: {accuracy:.2f}%")

    # Cleanup
    print("\n[CLEAN] Cleaning up database...")
    cursor.execute('DELETE FROM "SourceCodeEmbedding" WHERE "projectId" = %s', (project_id,))
    cursor.execute('DELETE FROM "Project" WHERE id = %s', (project_id,))
    conn.commit()
    print("[OK] Cleanup complete.")

if __name__ == "__main__":
    try:
        run()
    finally:
        cursor.close()
        conn.close()
