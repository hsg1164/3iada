@echo off
title API Server - عيادة د. زياد أبو دقة
cd /d "%~dp0"

:: Set environment variables
set SUPABASE_URL=https://eoezxxbrpsbyfaivnmem.supabase.co
set SUPABASE_SECRET_KEY=REMOVED_SECRET
set PORT=8080

echo Building API server...
cd /d "%~dp0artifacts\api-server"
call pnpm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Starting API server on port %PORT%...
pnpm run start
pause
