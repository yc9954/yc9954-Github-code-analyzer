#!/bin/bash

# API Verification Script for GitHub Analyzer
# Usage: ./verify_api.sh [accessToken]

API_BASE="https://api.sprintgit.com"
TOKEN=$1

echo "=== API Stability Audit ==="

# 1. Public Sprints
echo -n "[1/5] Checking Public Sprints... "
res=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/sprints")
if [ "$res" -eq 200 ]; then echo "OK"; else echo "FAILED ($res)"; fi

# 2. Public Rankings
echo -n "[2/5] Checking Global Rankings... "
res=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/rankings/users?scope=GLOBAL")
if [ "$res" -eq 200 ]; then echo "OK"; else echo "FAILED ($res)"; fi

# 3. Public Search
echo -n "[3/5] Checking Integrated Search... "
res=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/search?q=demo&type=ALL")
if [ "$res" -eq 200 ]; then echo "OK"; else echo "FAILED ($res)"; fi

if [ -z "$TOKEN" ]; then
    echo "--- Skipping authenticated endpoints (No token provided) ---"
    echo "To check all endpoints, run: ./verify_api.sh YOUR_ACCESS_TOKEN"
else
    # 4. My Profile
    echo -n "[4/5] Checking My Profile... "
    res=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE/api/users/me")
    if [ "$res" -eq 200 ]; then echo "OK"; else echo "FAILED ($res)"; fi

    # 5. My Dashboard
    echo -n "[5/5] Checking My Dashboard... "
    res=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$API_BASE/api/users/me/dashboard")
    if [ "$res" -eq 200 ]; then echo "OK"; else echo "FAILED ($res)"; fi
fi

echo "=== Audit Complete ==="
