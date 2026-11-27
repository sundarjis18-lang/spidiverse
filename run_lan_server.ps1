Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "       SPIDER-CODE ARENA - HIGH CONCURRENCY LAN HOST (60+ SYSTEMS)      " -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254*" -and 
    $_.IPAddress -notlike "192.168.56.*" 
} | Select-Object -ExpandProperty IPAddress -First 1)

if (-not $ip) { $ip = "127.0.0.1" }

Write-Host "[STATUS] Host LAN IP Address Detected: $ip" -ForegroundColor Green
Write-Host ""

$distIndex = Join-Path $PSScriptRoot "frontend\dist\index.html"
if (-not (Test-Path $distIndex)) {
    Write-Host "[INFO] Building frontend for optimized production serving..." -ForegroundColor Yellow
    Push-Location (Join-Path $PSScriptRoot "frontend")
    npm run build
    Pop-Location
} else {
    Write-Host "[OK] Frontend production build ready." -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host " CONNECT ALL 60 SYSTEMS VIA BROWSER TO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "     http://${ip}:8000" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host " Admin Credentials:" -ForegroundColor Yellow
Write-Host "     Username: spiderman | Password: pg123" -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[2/2] Starting High-Concurrency Server on 0.0.0.0:8000..." -ForegroundColor Green
Write-Host "(Press CTRL+C anytime to stop)" -ForegroundColor Gray
Write-Host ""

Push-Location (Join-Path $PSScriptRoot "backend")
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --limit-concurrency 500 --backlog 512
Pop-Location
