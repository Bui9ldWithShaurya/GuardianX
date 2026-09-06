# Guardian X Launch Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting Guardian X Proactive Safety Platform... " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$VenvPython = Join-Path $BackendDir ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Error "Virtual environment not found at $VenvPython"
    exit 1
}

Write-Host "Opening Guardian X Citizen Application at http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process "http://127.0.0.1:8000"

Set-Location $BackendDir
& $VenvPython -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
