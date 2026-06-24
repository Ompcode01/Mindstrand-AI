@echo off
echo =======================================================
echo     MindShield AI - Prototyping Environment Launcher
echo =======================================================
echo.
echo Starting the ecosystem in separate windows...
echo.

echo [1/3] Starting Next.js Web Dashboard...
start "MindShield Web" cmd /k "cd web && npm install && npm run dev"

echo [2/3] Starting FastAPI Backend...
start "MindShield API" cmd /k "cd api && pip install -r requirements.txt && uvicorn app.main:app --reload"

echo [3/3] Starting Flutter Companion App...
start "MindShield Mobile" cmd /k "cd mobile && flutter pub get && flutter run"

echo.
echo All services are booting up!
echo - Web: http://localhost:3000
echo - API: http://localhost:8000
echo - Mobile: Look for the device selection prompt in the new window.
echo.
pause
