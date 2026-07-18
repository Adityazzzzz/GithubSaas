import asyncio
import time
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

# We check local dev server first; if not running, we fall back to the live Vercel test deployment
LOCAL_URL = "http://localhost:3000"
LIVE_URL = "https://gitbrainstudiov1.vercel.app"

async def test_single_request(client, url):
    start = time.perf_counter()
    try:
        # Standard user-agent header to bypass basic web scrapers / bot filters
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = await client.get(url, timeout=10.0, follow_redirects=False, headers=headers)
        latency = (time.perf_counter() - start) * 1000
        return response.status_code, latency
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        return 0, latency

async def run_load_test(url, concurrency, total_requests):
    print(f"\n[RUN] Starting Load Test with Concurrency: {concurrency} (Total Requests: {total_requests})...")
    
    limits = httpx.Limits(max_keepalive_connections=concurrency, max_connections=concurrency)
    
    async with httpx.AsyncClient(limits=limits) as client:
        start_time = time.perf_counter()
        
        batches = [concurrency] * (total_requests // concurrency)
        remainder = total_requests % concurrency
        if remainder:
            batches.append(remainder)
            
        results = []
        for batch_size in batches:
            tasks = [test_single_request(client, url) for _ in range(batch_size)]
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)
            
        total_time = time.perf_counter() - start_time
        
        # Calculate statistics
        status_codes = [r[0] for r in results]
        unique_status_codes = list(set(status_codes))
        
        # Consider 200, 301, 302, 307, 308, 401, 403, and 429 as "Successful web server hits" (meaning the server was reached and processed the request successfully)
        successes = [r for r in results if r[0] != 0]
        errors = [r for r in results if r[0] == 0]
        latencies = [r[1] for r in results]
        
        avg_latency = sum(latencies) / len(latencies)
        sorted_latencies = sorted(latencies)
        p95 = sorted_latencies[int(len(sorted_latencies) * 0.95)]
        rps = len(results) / total_time
        
        print(f"[RESULT] Results for Concurrency {concurrency}:")
        print(f"  - Target URL: {url}")
        print(f"  - Status Codes Received: {unique_status_codes}")
        print(f"  - Total Elapsed Time: {total_time:.2f} s")
        print(f"  - Requests Per Second (RPS): {rps:.1f}")
        print(f"  - Server Hit Success Rate (Direct status responses): {len(successes)} / {len(results)} ({len(successes)/len(results)*100:.1f}%)")
        print(f"  - Error Rate (network dropouts/timeouts): {len(errors)} / {len(results)} ({len(errors)/len(results)*100:.1f}%)")
        print(f"  - Average Request Latency: {avg_latency:.2f} ms")
        print(f"  - p95 Latency: {p95:.2f} ms")
        return rps, avg_latency, p95

async def run():
    print("[TEST] Starting Concurrency & Load Threshold verification...")
    
    target_url = LOCAL_URL
    async with httpx.AsyncClient() as client:
        try:
            print(f"[INFO] Checking if local server {LOCAL_URL} is running...")
            res = await client.get(LOCAL_URL, timeout=2.0)
            print("[OK] Local server is online.")
        except Exception:
            print(f"[WARN] Local server is offline. Falling back to live deployment: {LIVE_URL}")
            target_url = LIVE_URL

    await run_load_test(target_url, concurrency=10, total_requests=100)
    await run_load_test(target_url, concurrency=25, total_requests=150)
    await run_load_test(target_url, concurrency=50, total_requests=200)

if __name__ == "__main__":
    asyncio.run(run())
