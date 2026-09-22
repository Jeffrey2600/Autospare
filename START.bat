@echo off
title AutoSpare Parts - Website
cd /d "%~dp0"

echo.
echo  ===============================================
echo    AutoSpare Parts - Starting the website
echo  ===============================================
echo.

where node >/dev/null 2>nul
if errorlevel 1 (
  echo  [X] Node.js is not installed.
  echo.
  echo      Please install it first:
  echo        1. Go to  https://nodejs.org
  echo        2. Download the "LTS" version and install it
  echo        3. Then double-click this file again
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo  First time setup - this takes a few minutes.
  echo  Please wait, do not close this window...
  echo.
  call npm install
  if errorlevel 1 goto failed
)

if not exist ".env" (
  call npm run setup
  if errorlevel 1 goto failed
)

echo.
echo  Starting... the website will open in your browser shortly.
echo  KEEP THIS WINDOW OPEN while using the website.
echo.

start "" /b cmd /c "timeout /t 12 /nobreak >/dev/null && start http://localhost:3000"
call npm run dev
goto end

:failed
echo.
echo  [X] Something went wrong. Please share this window with your developer.
echo.
pause
exit /b 1

:end
pause
