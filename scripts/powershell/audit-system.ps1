$reportDir = 'D:\Tools\AuditReports'
if (-not (Test-Path -LiteralPath $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$reportPath = Join-Path $reportDir ("audit-{0}.txt" -f (Get-Date -Format 'yyyy-MM-dd'))

function Write-Section {
  param([string]$Title, [object]$Data)

  Add-Content -Path $reportPath -Value "`n===== $Title ====="
  $Data | Out-String | Add-Content -Path $reportPath
}

if (Test-Path 'C:\') {
  $topFolders = Get-ChildItem -Path 'C:\' -Directory -ErrorAction SilentlyContinue |
    ForEach-Object {
      $size = (Get-ChildItem -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue |
        Measure-Object -Property Length -Sum).Sum
      [PSCustomObject]@{ Path = $_.FullName; SizeGB = [Math]::Round(($size / 1GB), 2) }
    } |
    Sort-Object SizeGB -Descending |
    Select-Object -First 20

  Write-Section -Title 'Top 20 Largest Folders on C:' -Data $topFolders

  $drive = Get-PSDrive -Name C -ErrorAction SilentlyContinue
  if ($drive) {
    $space = [PSCustomObject]@{
      Drive = 'C:'
      FreeGB = [Math]::Round(($drive.Free / 1GB), 2)
      UsedGB = [Math]::Round((($drive.Used) / 1GB), 2)
    }
    Write-Section -Title 'C: Free Space' -Data $space
  }
}

Write-Section -Title 'Installed Apps (Get-Package)' -Data (Get-Package -ErrorAction SilentlyContinue)
Write-Section -Title 'Running Services' -Data (Get-Service | Where-Object { $_.Status -eq 'Running' })
Write-Section -Title 'Startup Programs' -Data (Get-CimInstance Win32_StartupCommand -ErrorAction SilentlyContinue)

Write-Host "Audit saved to: $reportPath"
