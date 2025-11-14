#!/bin/bash
# CloudFlare R2 Upload Test Script

echo "=== CloudFlare R2 Upload Test ==="
echo ""

# Check if server is running
echo "Checking server status..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Server is running"
else
    echo "✗ Server is not running. Please run: pnpm run start:dev"
    exit 1
fi

echo ""
echo "Preparing to upload file: test-file.txt"
echo ""

# Execute upload
echo "Uploading..."
response=$(curl -X POST http://localhost:3000/r2/upload \
  -F "file=@test-file.txt" \
  -F "key=test/test-file.txt" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>&1)

echo "$response"
echo ""
echo "=== Test completed ==="

