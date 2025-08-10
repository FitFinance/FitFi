Param(
  [string]$GradleHome = 'D:\GradleCache',
  [string]$AndroidSdk = ''
)

Write-Host "Setting up Gradle and (optional) Android SDK environment..." -ForegroundColor Cyan

if (!(Test-Path $GradleHome)) {
  Write-Host "Creating $GradleHome" -ForegroundColor Yellow
  New-Item -ItemType Directory -Path $GradleHome | Out-Null
}

$env:GRADLE_USER_HOME = $GradleHome
Write-Host "Session GRADLE_USER_HOME=$env:GRADLE_USER_HOME" -ForegroundColor Green

if ($AndroidSdk -and (Test-Path $AndroidSdk)) {
  $env:ANDROID_SDK_ROOT = $AndroidSdk
  Write-Host "Session ANDROID_SDK_ROOT=$env:ANDROID_SDK_ROOT" -ForegroundColor Green
}

Write-Host "(Optional) To persist, add these as system env vars:" -ForegroundColor Cyan
Write-Host "  GRADLE_USER_HOME=$GradleHome"
if ($AndroidSdk) { Write-Host "  ANDROID_SDK_ROOT=$AndroidSdk" }

Write-Host "Done. Next: run 'npx expo run:android' in this same session." -ForegroundColor Cyan
