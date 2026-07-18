import asyncio
import time
import httpx
import os

# We test with 127.0.0.1 as it is more stable on Windows Python environments
URL = "http://127.0.0.1:3000"

async def test_single_request(client, url):
    start = time.perf_counter()
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = await client.get(url, timeout=15.0, follow_redirects=False, headers=headers)
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
        
        successes = [r for r in results if r[0] != 0]
        errors = [r for r in results if r[0] == 0]
        latencies = [r[1] for r in results]
        
        avg_latency = sum(latencies) / len(latencies)
        sorted_latencies = sorted(latencies)
        p95 = sorted_latencies[int(len(sorted_latencies) * 0.95)]
        p99 = sorted_latencies[int(len(sorted_latencies) * 0.99)]
        rps = len(results) / total_time
        
        print(f"[RESULT] Results for Concurrency {concurrency}:")
        print(f"  - Target URL: {url}")
        print(f"  - Status Codes Received: {unique_status_codes}")
        print(f"  - Total Elapsed Time: {total_time:.2f} s")
        print(f"  - Requests Per Second (RPS): {rps:.1f}")
        print(f"  - Server Hit Success Rate: {len(successes)} / {len(results)} ({len(successes)/len(results)*100:.1f}%)")
        print(f"  - Error Rate (network timeouts): {len(errors)} / {len(results)} ({len(errors)/len(results)*100:.1f}%)")
        print(f"  - Average Request Latency: {avg_latency:.2f} ms")
        print(f"  - p95 Latency: {p95:.2f} ms")
        print(f"  - p99 Latency: {p99:.2f} ms")
        return rps, avg_latency, p95

async def run():
    print("[TEST] Starting Local 1,000-User Concurrency & Load Stress Test...")
    
    # Try connecting to localhost first, then 127.0.0.1
    active_url = URL
    async with httpx.AsyncClient() as client:
        try:
            print("[INFO] Checking http://127.0.0.1:3000...")
            res = await client.get("http://127.0.0.1:3000", timeout=2.0)
            print("[OK] Connected to http://127.0.0.1:3000")
        except Exception:
            try:
                print("[INFO] Checking http://localhost:3000...")
                res = await client.get("http://localhost:3000", timeout=2.0)
                active_url = "http://localhost:3000"
                print("[OK] Connected to http://localhost:3000")
            except Exception as e:
                print(f"[ERROR] Local Next.js server not reachable on 127.0.0.1 or localhost! Error: {e}")
                return

    # Run load test sequences scaling up to 1,000 requests
    await run_load_test(active_url, concurrency=100, total_requests=500)
    await run_load_test(active_url, concurrency=250, total_requests=1000)
    await run_load_test(active_url, concurrency=500, total_requests=1000)
    await run_load_test(active_url, concurrency=1000, total_requests=1000)
    
if __name__ == "__main__":
    asyncio.run(run())
