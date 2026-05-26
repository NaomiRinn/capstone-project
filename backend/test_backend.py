# -*- coding: utf-8 -*-
"""
test_backend.py - End-to-end test script for the AUVRA Backend API.

Jalankan SETELAH server berjalan di http://localhost:8000:
    python test_backend.py

Semua 6 langkah harus menampilkan [PASS].
"""
import io
import sys
import time

import requests
from PIL import Image

BASE_URL = "http://localhost:8000"
TIMEOUT = 15


# --- Helpers ------------------------------------------------------------------

def _pass(label: str) -> None:
    print(f"  [PASS] {label}")


def _fail(label: str, reason: str) -> None:
    print(f"  [FAIL] {label} -- {reason}")
    sys.exit(1)


def _make_dummy_image() -> bytes:
    """Create a tiny 64x64 red JPEG in memory."""
    img = Image.new("RGB", (64, 64), color=(200, 80, 80))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


# --- Test Steps ---------------------------------------------------------------

def step1_health_check() -> None:
    print("\n[1/6] Health Check")
    r = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
    if r.status_code != 200:
        _fail("GET /", f"status {r.status_code}")
    data = r.json()
    if data.get("status") != "ok":
        _fail("GET /", f"status field = {data.get('status')}")
    print(f"       ai_mode = {data.get('ai_mode')} | version = {data.get('version')}")
    _pass("GET / returned status=ok")


def step2_upload() -> str:
    print("\n[2/6] Upload Image")
    image_bytes = _make_dummy_image()
    r = requests.post(
        f"{BASE_URL}/api/v1/scans/upload",
        files={"image": ("test.jpg", image_bytes, "image/jpeg")},
        timeout=TIMEOUT,
    )
    if r.status_code not in (200, 202):
        _fail("POST /upload", f"status {r.status_code} -- {r.text}")
    data = r.json()
    scan_id = data.get("scanId")
    if not scan_id:
        _fail("POST /upload", "no scanId in response")
    print(f"       scanId = {scan_id}")
    _pass("POST /upload accepted image")
    return scan_id


def step3_poll(scan_id: str) -> dict:
    print("\n[3/6] Polling for result")
    max_attempts = 20
    for attempt in range(1, max_attempts + 1):
        time.sleep(1.5)
        r = requests.get(f"{BASE_URL}/api/v1/scans/{scan_id}", timeout=TIMEOUT)
        if r.status_code != 200:
            _fail("GET /{scan_id}", f"status {r.status_code}")
        data = r.json()
        status = data.get("status")
        print(f"       attempt {attempt:2d} -- status={status}")
        if status == "completed":
            _pass(f"Scan completed after {attempt} poll(s)")
            return data
        if status == "failed":
            _fail("Polling", "scan status = failed")
    _fail("Polling", f"timeout after {max_attempts} attempts")
    return {}


def step4_validate(data: dict) -> None:
    print("\n[4/6] Validate Result Fields")
    required = ["severity", "overallScore", "features", "recommendations"]
    for field in required:
        if data.get(field) is None:
            _fail(f"Validate field '{field}'", "field missing or null")
    print(f"       severity={data['severity']}  score={data['overallScore']}")
    print(f"       features={len(data['features'])}  recommendations={len(data['recommendations'])}")
    _pass("All required result fields present")


def step5_list(scan_id: str) -> None:
    print("\n[5/6] List Scans")
    r = requests.get(f"{BASE_URL}/api/v1/scans", timeout=TIMEOUT)
    if r.status_code != 200:
        _fail("GET /scans", f"status {r.status_code}")
    items = r.json()
    ids = [item.get("id") for item in items]
    if scan_id not in ids:
        _fail("GET /scans", f"scan {scan_id} not in list")
    print(f"       Total scans in list: {len(items)}")
    _pass(f"Scan {scan_id} found in list")


def step6_delete(scan_id: str) -> None:
    print("\n[6/6] Delete Scan")
    r = requests.delete(f"{BASE_URL}/api/v1/scans/{scan_id}", timeout=TIMEOUT)
    if r.status_code != 204:
        _fail("DELETE /{scan_id}", f"status {r.status_code}")
    _pass("Scan deleted (204 No Content)")


# --- Main ---------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 55)
    print("  AUVRA Backend - End-to-End Test")
    print(f"  Target: {BASE_URL}")
    print("=" * 55)

    step1_health_check()
    scan_id = step2_upload()
    result = step3_poll(scan_id)
    step4_validate(result)
    step5_list(scan_id)
    step6_delete(scan_id)

    print("\n" + "=" * 55)
    print("  ALL 6 STEPS PASSED!")
    print("=" * 55)
