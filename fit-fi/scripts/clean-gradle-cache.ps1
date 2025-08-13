Param(
  [switch]$DryRun,
  [switch]$Force,
  [switch]$PurgeNodeModules,
  [string]$BackupDir = ''
)

# Determine original Gradle cache (default user profile)
$orig = Join-Path $env:USERPROFILE '.gradle'
if (!(Test-Path $orig)) {
  Write-Host "No original Gradle cache found at $orig" -ForegroundColor Yellow
  exit 0
}

# If backup dir not provided, create under %USERPROFILE%\.gradle-backups\yyyyMMdd-HHmmss
if (-not $BackupDir) {
  $stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
  $BackupDir = Join-Path $env:USERPROFILE ".gradle-backups/$stamp"
}

Write-Host "Original Gradle cache: $orig" -ForegroundColor Cyan
Write-Host "Backup target: $BackupDir" -ForegroundColor Cyan

# Size estimation
function Get-DirSizeMB($path) {
  if (!(Test-Path $path)) { return 0 }
  $bytes = (Get-ChildItem -LiteralPath $path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
  [math]::Round($bytes / 1MB, 2)
}
$sizeMB = Get-DirSizeMB $orig
Write-Host ("Current size: {0} MB" -f $sizeMB) -ForegroundColor DarkGray

if ($DryRun) {
  Write-Host "DryRun ON: no changes will be made." -ForegroundColor Yellow
}

if (-not $DryRun) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
  Write-Host "Moving cache to backup..." -ForegroundColor Green
  try {
    Move-Item -Path $orig -Destination $BackupDir -Force
  } catch {
    if (-not $Force) {
      Write-Host "Move failed: $($_.Exception.Message). Use -Force to attempt deletion instead." -ForegroundColor Red
      exit 1
    } else {
      Write-Host "Move failed; attempting deletion because -Force specified" -ForegroundColor Yellow
      Remove-Item -Recurse -Force $orig
    }
  }
}

if ($PurgeNodeModules) {
  $nodeModules = Join-Path (Get-Location) 'node_modules'
  if (Test-Path $nodeModules) {
    if ($DryRun) {
      Write-Host "[DryRun] Would remove $nodeModules" -ForegroundColor Yellow
    } else {
      Write-Host "Removing node_modules (PurgeNodeModules)..." -ForegroundColor Magenta
      Remove-Item -Recurse -Force $nodeModules
    }
  }
}

Write-Host "Done. New Gradle cache will be created on next build (using GRADLE_USER_HOME if set)." -ForegroundColor Cyan
Write-Host "Backup kept at: $BackupDir" -ForegroundColor Cyan
