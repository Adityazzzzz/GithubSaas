import os
import time
import psycopg2
import google.generativeai as genai
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

projectId = "cmjff8mve0000jo0umgdch5x7"

# 1. Fetch files in project
cursor.execute('SELECT "fileName", "summary" FROM "SourceCodeEmbedding" WHERE "projectId" = %s', (projectId,))
db_files = cursor.fetchall()

print(f"Indexed files found: {len(db_files)}")
if len(db_files) == 0:
    print("[ERROR] No files indexed in DB for project cmjff8mve0000jo0umgdch5x7. Run check-db first.")
    exit(1)

# Generate a list of evaluation queries
eval_queries = []

# List of manual high-quality queries we know are in the project
manual_queries = [
    ("Where is the main home page page.tsx?", "citadel/app/page.tsx"),
    ("Find the tailwind css config file", "citadel/tailwind.config.ts"),
    ("Where is the next.js config options file?", "citadel/next.config.ts"),
    ("Find the typescript compiler tsconfig.json configuration", "citadel/tsconfig.json"),
    ("Where is the dialog shadcn/ui modal component?", "citadel/components/ui/dialog.tsx"),
    ("Find the layout.tsx file that wraps the app", "citadel/app/layout.tsx"),
    ("Where is the accordion component?", "citadel/components/ui/accordion.tsx"),
    ("Where do we configure package dependencies and lockfile?", "citadel/package.json"),
    ("Where is the avatar picture component?", "citadel/components/ui/avatar.tsx"),
    ("Find the alert dialog component for custom prompts", "citadel/components/ui/alert-dialog.tsx"),
    ("Where is the calendar or datepicker component?", "citadel/components/ui/calendar.tsx"),
    ("Find the aspect ratio styling wrapper component", "citadel/components/ui/aspect-ratio.tsx"),
    ("Where is the menu bar navigation list component?", "citadel/components/ui/menubar.tsx"),
    ("Find the breadcrumb navigation hierarchy links", "citadel/components/ui/breadcrumb.tsx"),
    ("Where is the alert banner overlay component?", "citadel/components/ui/alert.tsx"),
]

for query, expected in manual_queries:
    eval_queries.append({"query": query, "expected": expected})

# Programmatically generate queries from other files to reach 50 queries total
other_files = [f for f in db_files if f[0] not in [m[1] for m in manual_queries]]

for f in other_files[:35]: # add 35 programmatic queries to make it exactly 50
    file_name = f[0]
    summary = f[1]
    
    # Extract file basename
    basename = file_name.split("/")[-1]
    
    # Generate query based on summary or name
    words = summary.split()[:10]
    summary_snippet = " ".join(words)
    query = f"Where is the file that handles {summary_snippet}?"
    
    eval_queries.append({"query": query, "expected": file_name})

print(f"[INFO] Evaluation set size: {len(eval_queries)} queries.")

def get_embedding(text):
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        output_dimensionality=768
    )
    return result['embedding']

def run():
    hits = 0
    failures = []
    
    print("\n[RUN] Running RAG accuracy queries...")
    for idx, item in enumerate(eval_queries):
        query_text = item["query"]
        expected_file = item["expected"]
        
        try:
            # Call Gemini
            emb = get_embedding(query_text)
            vec_str = f"[{','.join(map(str, emb))}]"
            
            # Query Database
            sql_query = f"""
                SELECT "fileName",
                       1 - ("summaryEmbedding" <=> '{vec_str}'::vector) AS similarity
                FROM "SourceCodeEmbedding"
                WHERE "projectId" = '{projectId}' AND 1 - ("summaryEmbedding" <=> '{vec_str}'::vector) > 0.1
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
                print(f"  [{idx + 1}/50] PASS (Rank {top_rank}) - Query: \"{query_text[:40]}...\"")
            else:
                failures.append((query_text, expected_file, [m[0] for m in matches]))
                print(f"  [{idx + 1}/50] FAIL - Query: \"{query_text[:40]}...\" (Expected: {expected_file})")
                
        except Exception as e:
            print(f"  [{idx + 1}/50] ERROR - Query: \"{query_text[:40]}...\" (Error: {e})")
            
        # Throttling to avoid Gemini rate limits
        time.sleep(1.0)

    accuracy = (hits / len(eval_queries)) * 100
    print("\n[RESULT] RAG ACCURACY EVALUATION RESULTS:")
    print(f"- Total Queries Evaluated: {len(eval_queries)}")
    print(f"- Successful Matches (Top-5): {hits}")
    print(f"- Failed Matches: {len(failures)}")
    print(f"- Measured Accuracy: {accuracy:.2f}%")

    if failures:
        print("\n[FAILURES] Sample Retrieval Failures:")
        for idx, f in enumerate(failures[:3]):
            print(f"  {idx + 1}. Query: \"{f[0]}\"")
            print(f"     Expected: {f[1]}")
            print(f"     Got: {f[2]}")

if __name__ == "__main__":
    try:
        run()
    finally:
        cursor.close()
        conn.close()
