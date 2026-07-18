import os
import time
import random
import re
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL not set in environment.")

print("[CONN] Connecting to Neon PostgreSQL...")
conn = psycopg2.connect(db_url)
cursor = conn.cursor()

def generate_random_vector(dimensions=768):
    vec = [random.random() for _ in range(dimensions)]
    norm = sum(x*x for x in vec) ** 0.5
    return [x / norm for x in vec]

def run():
    print("[TEST] Starting Database-Level Query Latency Profile...")
    
    # 1. Create a mock project
    project_id = "mock_latency_python_project"
    cursor.execute(
        'INSERT INTO "Project" (id, name, "githubUrl", branch, "updatedAt") VALUES (%s, %s, %s, %s, NOW()) ON CONFLICT (id) DO NOTHING',
        (project_id, "MOCK_LATENCY_PYTHON", "https://github.com/mock/mock", "main")
    )
    conn.commit()
    print(f"[INFO] Mock Project Created/Verified: {project_id}")

    # 2. Seed 1,000 mock embeddings
    cursor.execute('DELETE FROM "SourceCodeEmbedding" WHERE "projectId" = %s', (project_id,))
    conn.commit()

    print("[SEED] Preparing 1,000 mock vector rows...")
    data = []
    for i in range(1000):
        vec = generate_random_vector(768)
        vec_str = f"[{','.join(map(str, vec))}]"
        data.append((
            f"mock_emb_py_{i}",
            project_id,
            f"src/MockFile_{i}.py",
            f"Mock summary {i}",
            "print('hello')",
            vec_str
        ))

    print("[SEED] Bulk inserting 1,000 mock vectors in a single transaction...")
    insert_query = 'INSERT INTO "SourceCodeEmbedding" (id, "projectId", "fileName", "summary", "sourceCode", "summaryEmbedding") VALUES %s'
    psycopg2.extras.execute_values(cursor, insert_query, data, template="(%s, %s, %s, %s, %s, %s::vector)")
    conn.commit()
    print("[OK] Seeding complete.")

    # 3. Profile 100 searches using EXPLAIN ANALYZE (to extract raw DB engine execution time)
    print("\n[RUN] Profiling 100 similarity searches using EXPLAIN ANALYZE...")
    engine_times = []
    
    for q in range(100):
        q_vec = generate_random_vector(768)
        q_vec_str = f"[{','.join(map(str, q_vec))}]"
        
        # Use EXPLAIN ANALYZE to get true Postgres-only execution time
        query = f"""
            EXPLAIN ANALYZE
            SELECT "id", "fileName",
                   1 - ("summaryEmbedding" <=> '{q_vec_str}'::vector) AS similarity
            FROM "SourceCodeEmbedding"
            WHERE "projectId" = '{project_id}' AND 1 - ("summaryEmbedding" <=> '{q_vec_str}'::vector) > 0.1
            ORDER BY similarity DESC
            LIMIT 5
        """
        cursor.execute(query)
        explain_rows = cursor.fetchall()
        
        # Parse output to find "Planning Time" and "Execution Time"
        planning_time = 0.0
        execution_time = 0.0
        for row in explain_rows:
            line = row[0]
            if "Planning Time" in line:
                match = re.search(r"Planning Time:\s*([\d.]+)\s*ms", line)
                if match:
                    planning_time = float(match.group(1))
            elif "Execution Time" in line:
                match = re.search(r"Execution Time:\s*([\d.]+)\s*ms", line)
                if match:
                    execution_time = float(match.group(1))
        
        total_db_time = planning_time + execution_time
        engine_times.append(total_db_time)

    # 4. Calculate stats
    avg_latency = sum(engine_times) / len(engine_times)
    sorted_times = sorted(engine_times)
    min_lat = sorted_times[0]
    max_lat = sorted_times[-1]
    p50 = sorted_times[int(len(sorted_times) * 0.50)]
    p95 = sorted_times[int(len(sorted_times) * 0.95)]
    p99 = sorted_times[int(len(sorted_times) * 0.99)]

    print("\n[RESULT] DATABASE ENGINE PERFORMANCE METRICS (EXCLUDING NETWORK RTT):")
    print(f"- Total Simulated Files: 1,000 files")
    print(f"- Average Execution Latency: {avg_latency:.2f} ms")
    print(f"- Minimum Latency: {min_lat:.2f} ms")
    print(f"- Median (p50) Latency: {p50:.2f} ms")
    print(f"- p95 Latency: {p95:.2f} ms")
    print(f"- p99 Latency: {p99:.2f} ms")
    print(f"- Maximum Latency: {max_lat:.2f} ms")

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
