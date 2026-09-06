@echo off
echo ===================================================
echo   Starting Guardian X Proactive Safety Platform...
echo ===================================================

cd /d "%~dp0backend"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in backend\.venv.
    pause
    exit /b 1
)

echo Starting Guardian X Backend & Frontend on http://127.0.0.1:8000 ...
start http://127.0.0.1:8000

.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
