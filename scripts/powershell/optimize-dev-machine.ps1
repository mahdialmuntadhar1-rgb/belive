$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host 'Administrator privileges are required. Please rerun as Administrator.'
  exit 1
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host 'Step 1/4: Running system audit...'
& (Join-Path $scriptRoot 'audit-system.ps1')

Write-Host 'Step 2/4: Setting up D: development drive structure...'
& (Join-Path $scriptRoot 'setup-dev-drive.ps1')

Write-Host 'Step 3/4: Configuring package caches...'
& (Join-Path $scriptRoot 'configure-dev-caches.ps1')

Write-Host 'Step 4/4: Performing safe clean...'
& (Join-Path $scriptRoot 'safe-clean.ps1')

Write-Host 'Optimization suite complete.'
