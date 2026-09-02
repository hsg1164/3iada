@echo off
title عيادة د. زياد أبو دقة - نظام الإدارة
cd /d "%~dp0"
cls
echo =============================================
echo   عيادة د. زياد أبو دقة للتجميل والليزر
echo   نظام الإدارة المتكامل
echo =============================================
echo.

:: Set environment variables
set SUPABASE_URL=https://eoezxxbrpsbyfaivnmem.supabase.co
set SUPABASE_SECRET_KEY=REMOVED_SECRET
set API_SERVER_URL=http://localhost:8080

:: ============================================
:: Step 1: Build API server (in this window so errors are visible)
:: ============================================
echo [1/3] Building API server...
cd /d "%~dp0artifacts\api-server"
call pnpm run build
if %errorlevel% neq 0 (
    echo =============================================
    echo   فشل بناء خادم API
    echo   راجع الأخطاء أعلاه
    echo =============================================
    pause
    exit /b 1
)
echo [OK] Build successful!
echo.

:: ============================================
:: Step 2: Start API server in background
:: ============================================
echo [2/3] Starting API server on port 8080...
start "API Server" cmd /c "title API Server && cd /d %~dp0artifacts\api-server && pnpm run start"

:: Health check — wait until the server responds (GET /api/healthz)
echo Waiting for API server to be ready...
set attempts=0
:healthcheck
>nul 2>&1 curl.exe -s -f http://localhost:8080/api/healthz && goto ready
set /a attempts+=1
if %attempts% geq 30 (
    echo =============================================
    echo   خادم API لم يستجب بعد 60 ثانية
    echo   تأكد من نافذة API Server
    echo =============================================
    pause
    exit /b 1
)
timeout /t 2 /nobreak >nul
goto healthcheck
:ready
echo [OK] API Server is ready!
echo.

:: ============================================
:: Step 3: Start Frontend
:: ============================================
echo [3/3] Starting Frontend on port 20964...
cd /d "%~dp0artifacts\clinic"
set PORT=20964
set BASE_PATH=/
start "Frontend" cmd /c "title Frontend && cd /d %~dp0artifacts\clinic && pnpm run dev"

echo.
echo =============================================
echo   ^^^ النظام يعمل الآن:
echo   - API Server: http://localhost:8080
echo   - Frontend:   http://localhost:20964
echo =============================================
echo.
pause
