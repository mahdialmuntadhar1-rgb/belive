@echo off
echo ============================================
echo CLEAN BUSINESS CSV FOR SUPABASE
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting CSV cleaning...
echo.

REM Run the cleaning script
node clean_businesses.js

echo.
pause
