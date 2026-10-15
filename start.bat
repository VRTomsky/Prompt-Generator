@echo off
title Prompt-Generator
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js wurde nicht gefunden. Installiere es von https://nodejs.org und starte diese Datei erneut.
  pause
  exit /b 1
)
start "" cmd /c "timeout /t 1 >nul & start http://localhost:5190"
node server.js
