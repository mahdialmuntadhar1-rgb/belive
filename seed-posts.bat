@echo off
REM Windows batch script to seed Shaku Maku posts

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Shaku Maku Seed Script
echo ========================================
echo.

REM Set Supabase credentials
set VITE_SUPABASE_URL=https://hsadukhmcclwixuntqwu.supabase.co
set VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns

echo [1/3] Installing dependencies...
call npm install >nul 2>&1

echo [2/3] Environment configured
echo       VITE_SUPABASE_URL: %VITE_SUPABASE_URL%
echo       VITE_SUPABASE_ANON_KEY: (set)

echo.
echo [3/3] Running seed script...
echo.

call npx ts-node scripts/seed-business-postcards-flexible.ts

echo.
echo ========================================
echo  Seeding Complete!
echo ========================================
echo.

pause
