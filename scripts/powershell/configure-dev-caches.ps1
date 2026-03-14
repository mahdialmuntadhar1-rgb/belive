if (-not (Test-Path -LiteralPath 'D:\Cache')) {
  New-Item -ItemType Directory -Path 'D:\Cache' -Force | Out-Null
}

$cacheFolders = @('D:\Cache\pip', 'D:\Cache\yarn', 'D:\Tools\npm-global')
foreach ($folder in $cacheFolders) {
  if (-not (Test-Path -LiteralPath $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "Created: $folder"
  }
  else {
    Write-Host "Exists: $folder"
  }
}

npm config set cache "D:\Cache\npm"
Write-Host 'Configured npm cache: D:\Cache\npm'

[Environment]::SetEnvironmentVariable('PIP_CACHE_DIR', 'D:\Cache\pip', 'Machine')
Write-Host 'Configured pip cache via PIP_CACHE_DIR: D:\Cache\pip'

yarn config set cache-folder "D:\Cache\yarn"
Write-Host 'Configured yarn cache: D:\Cache\yarn'

npm config set prefix "D:\Tools\npm-global"
Write-Host 'Configured npm global prefix: D:\Tools\npm-global'
