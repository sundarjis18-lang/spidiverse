@echo off
title SPIDER-CODE ARENA - LAN HOST (60+ SYSTEMS)
cls
echo ========================================================================
echo        SPIDER-CODE ARENA - HIGH CONCURRENCY LAN HOST (60+ SYSTEMS)
echo ========================================================================
echo.

:: Detect local LAN IP address
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254*' -and $_.IPAddress -notlike '192.168.56.*' } | Select-Object -ExpandProperty IPAddress -First 1)"') do set LAN_IP=%%i

if "%LAN_IP%"=="" set LAN_IP=127.0.0.1

echo [STATUS] Host LAN IP Address Detected: %LAN_IP%
echo.
echo [1/2] Checking Frontend Production Build...
if not exist "%~dp0frontend\dist\index.html" (
    echo [INFO] Building frontend for optimized production serving...
    cd /d "%~dp0frontend"
    call npm run build
    cd /d "%~dp0"
) else (
    echo [OK] Frontend production build found.
)

echo.
echo ========================================================================
echo  CONNECT ALL 60 SYSTEMS VIA BROWSER TO:
echo.
echo      http://%LAN_IP%:8000
echo.
echo  Admin Credentials:
echo      Username: spiderman  ^|  Password: pg123
echo ========================================================================
echo.
echo [2/2] Starting High-Concurrency Server on 0.0.0.0:8000...
echo (Press CTRL+C anytime to stop)
echo.
cd /d "%~dp0backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --limit-concurrency 500 --backlog 512
pause
