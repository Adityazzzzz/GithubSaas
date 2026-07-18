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

# Fetch all files in the project
cursor.execute('SELECT "id", "fileName", "summary" FROM "SourceCodeEmbedding" WHERE "projectId" = %s', (projectId,))
db_files = cursor.fetchall()
print(f"[INFO] Found {len(db_files)} files in banking project to re-embed.")

def get_embedding(text):
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        output_dimensionality=768
    )
    return result['embedding']

def run():
    print("[RUN] Generating new embeddings using models/gemini-embedding-001 (768 dimensions)...")
    for idx, (file_id, file_name, summary) in enumerate(db_files):
        # Fallback if summary is empty/placeholder
        text_to_embed = summary if (summary and len(summary) > 5) else f"Code file for {file_name}"
        
        try:
            emb = get_embedding(text_to_embed)
            vec_str = f"[{','.join(map(str, emb))}]"
            
            cursor.execute(
                'UPDATE "SourceCodeEmbedding" SET "summaryEmbedding" = %s::vector WHERE "id" = %s',
                (vec_str, file_id)
            )
            
            # Print progress every 10 files
            if (idx + 1) % 10 == 0 or (idx + 1) == len(db_files):
                print(f"  Processed {idx + 1}/{len(db_files)} files...")
                conn.commit()
                
        except Exception as e:
            print(f"  Error on file {file_name}: {e}")
            
        time.sleep(1.0) # Avoid rate limits
        
    conn.commit()
    print("[OK] Reindexing completed successfully!")

if __name__ == "__main__":
    try:
        run()
    finally:
        cursor.close()
        conn.close()
