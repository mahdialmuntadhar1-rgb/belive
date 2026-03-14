Remove-Item 'C:\Windows\Temp\*' -Recurse -Force -ErrorAction SilentlyContinue
Write-Host 'Cleaned: C:\Windows\Temp\*'

Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleaned: $env:TEMP\*"

$edgeCache = Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data\Default\Cache\*'
Remove-Item $edgeCache -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleaned: $edgeCache"

Write-Host 'Safety check: this script does not target C:\Windows\System32 or Program Files.'
