$folders = @(
  'D:\Dev',
  'D:\Tools',
  'D:\Tools\PowerShell',
  'D:\Tools\AuditReports',
  'D:\Projects',
  'D:\Workspace',
  'D:\Temp',
  'D:\Cache',
  'D:\Downloads',
  'D:\Containers',
  'D:\Datasets'
)

foreach ($folder in $folders) {
  if (-not (Test-Path -LiteralPath $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "Created: $folder"
  }
  else {
    Write-Host "Exists: $folder"
  }
}

[Environment]::SetEnvironmentVariable('TEMP', 'D:\Temp', 'Machine')
[Environment]::SetEnvironmentVariable('TMP', 'D:\Temp', 'Machine')
Write-Host 'System TEMP and TMP set to D:\Temp'
