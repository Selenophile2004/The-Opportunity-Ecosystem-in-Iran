@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title ILIA - Opportunity Ecosystem

if not defined ILIA_PORT set "ILIA_PORT=3000"
set /a "ILIA_MAX_PORT=ILIA_PORT+10" >nul 2>nul

echo.
echo ============================================================
echo   ILIA - The Opportunity Ecosystem in Iran
echo ============================================================
echo.

where.exe node >nul 2>nul
if errorlevel 1 goto :node_missing

if exist "node_modules\.bin\next.cmd" goto :dependencies_ready

where.exe pnpm >nul 2>nul
if errorlevel 1 goto :pnpm_missing

echo [SETUP] Installing project dependencies...
call pnpm install --frozen-lockfile
if errorlevel 1 goto :install_failed

:dependencies_ready
:select_port
netstat -ano | findstr /R /C:":%ILIA_PORT% .*LISTENING" >nul 2>nul
if errorlevel 1 goto :port_ready

echo [WARN] Port %ILIA_PORT% is already in use. Trying the next port...
set /a "ILIA_PORT+=1" >nul
if %ILIA_PORT% GTR %ILIA_MAX_PORT% goto :ports_unavailable
goto :select_port

:port_ready
call :set_urls

if not exist ".next\BUILD_ID" goto :build_project

powershell.exe -NoProfile -Command "$build=(Get-Item '.next\BUILD_ID').LastWriteTimeUtc; $paths=@('app','components','lib','content','public','package.json','next.config.ts','tsconfig.json'); foreach($path in $paths){ if(Test-Path $path){ $item=Get-Item $path; if($item.PSIsContainer){ if(Get-ChildItem -LiteralPath $path -Recurse -File | Where-Object { $_.LastWriteTimeUtc -gt $build } | Select-Object -First 1){ exit 1 } } elseif($item.LastWriteTimeUtc -gt $build){ exit 1 } } }; exit 0" >nul 2>nul
if not errorlevel 1 goto :production_ready

:build_project
echo [BUILD] Preparing the latest production version...
call npm.cmd run build
if errorlevel 1 goto :build_failed

:production_ready

echo [START] Project address: %ILIA_URL%
echo [INFO] Keep this window open while using the website.
echo [INFO] Press Ctrl+C to stop the server.
echo.

if /I "%ILIA_NO_BROWSER%"=="1" goto :start_server
start "ILIA browser launcher" /b powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 5; Start-Process '%ILIA_LAUNCH_URL%'"

:start_server
call "node_modules\.bin\next.cmd" start -p "%ILIA_PORT%"
set "ILIA_EXIT_CODE=%ERRORLEVEL%"
echo.

if "%ILIA_EXIT_CODE%"=="0" (
  echo [STOPPED] The development server has stopped.
) else (
  echo [ERROR] The production server exited with code %ILIA_EXIT_CODE%.
  echo Check whether port %ILIA_PORT% is already in use.
)
goto :finish

:build_failed
set "ILIA_EXIT_CODE=1"
echo.
echo [ERROR] The production build could not be created.
echo Run "npm run build" in this folder and review the error above.
goto :finish

:node_missing
set "ILIA_EXIT_CODE=1"
echo [ERROR] Node.js was not found.
echo Install Node.js 22 or newer and run this file again.
goto :finish

:pnpm_missing
set "ILIA_EXIT_CODE=1"
echo [ERROR] pnpm was not found and dependencies are not installed.
echo Install pnpm 10 or newer and run this file again.
goto :finish

:install_failed
set "ILIA_EXIT_CODE=1"
echo.
echo [ERROR] Dependency installation failed.
goto :finish

:ports_unavailable
set "ILIA_EXIT_CODE=1"
echo [ERROR] No free port was found in the requested range.
echo Close another local server and run this file again.
goto :finish

:set_urls
set "ILIA_URL=http://localhost:%ILIA_PORT%/en/canvas"
set "ILIA_LAUNCH_URL=%ILIA_URL%?launch=%RANDOM%%RANDOM%"
exit /b 0

:finish
echo.
echo This window will remain open so you can read any message above.
pause
endlocal & exit /b %ILIA_EXIT_CODE%
