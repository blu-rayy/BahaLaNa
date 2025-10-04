import os
import requests
import json

"""Simple test client for the local /api/imerg endpoint.

Set environment variable EARTHDATA_JWT to the full JWT string (no 'Bearer ' prefix needed here).
"""

BASE = os.environ.get("BAHALANA_API", "http://127.0.0.1:8000")
TOKEN = os.environ.get("EARTHDATA_JWT")

if not TOKEN:
    print("Please set EARTHDATA_JWT environment variable to your full Earthdata JWT token (no 'Bearer ').")
    raise SystemExit(1)

url = f"{BASE}/api/imerg"
headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
payload = {"start_date": "2025-09-30", "end_date": "2025-09-30", "bbox": "115,4,126,21"}

print(f"POST {url} with Authorization header (Bearer) and body: {payload}")
resp = requests.post(url, headers=headers, json=payload, timeout=180)
try:
    resp.raise_for_status()
except Exception as e:
    print("Request failed:", e)
    print("Status code:", resp.status_code)
    print("Response body:", resp.text)
    raise

data = resp.json()
print(json.dumps(data, indent=2))

# save to file for inspection
with open("imerg_summary.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Saved summary to imerg_summary.json")
