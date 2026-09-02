@echo off
setlocal

cd /d "C:\Users\MOH\Documents\GG\dr-ziyad-cl\zip-repl"

set SUPABASE_URL=https://eoezxxbrpsbyfaivnmem.supabase.co
set SUPABASE_SECRET_KEY=REMOVED_SECRET
set DATABASE_URL=postgresql://postgres:RgcWtBtsHnMXH0Sm@db.eoezxxbrpsbyfaivnmem.supabase.co:5432/postgres
set API_SERVER_URL=http://localhost:8080
set PORT=8080

echo Starting API server on port 8080...
start "API Server" cmd /c "pnpm --filter @workspace/api-server run dev"

echo Starting clinic frontend on port 20964...
start "Clinic Frontend" cmd /c "cd /d C:\Users\MOH\Documents\GG\dr-ziyad-cl\zip-repl && set PORT=20964 && set BASE_PATH=/ && pnpm --filter @workspace/clinic run dev"

echo.
echo Services starting...
echo API Server: http://localhost:8080
echo Frontend:   http://localhost:20964
endlocal
