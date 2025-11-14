# CloudFlare R2 Upload Test Script

$serverUrl = "http://localhost:3000"
$testFile = "test-file.txt"

Write-Host "=== CloudFlare R2 Upload Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$serverUrl" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Server is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not running. Please run: pnpm run start:dev" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if test file exists
if (-not (Test-Path $testFile)) {
    Write-Host "✗ Test file not found: $testFile" -ForegroundColor Red
    exit 1
}

Write-Host "Preparing to upload file: $testFile" -ForegroundColor Yellow
$fileInfo = Get-Item $testFile
Write-Host "File size: $($fileInfo.Length) bytes" -ForegroundColor Gray
Write-Host ""

# Execute upload
Write-Host "Uploading..." -ForegroundColor Yellow
try {
    # Use curl to upload file (more reliable)
    $curlOutput = curl.exe -X POST "$serverUrl/r2/upload" `
        -F "file=@$testFile" `
        -F "key=test/test-file.txt" `
        2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Upload successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Response:" -ForegroundColor Cyan
        Write-Host $curlOutput
    } else {
        Write-Host "✗ Upload failed" -ForegroundColor Red
        Write-Host $curlOutput
        exit 1
    }
    
} catch {
    Write-Host "✗ Upload failed" -ForegroundColor Red
    Write-Host "Error message: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Test completed ===" -ForegroundColor Cyan

