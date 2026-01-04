$scriptDir = $PSScriptRoot
$projectRoot = Split-Path -Parent $scriptDir
$distDir = Join-Path $projectRoot "dist"

if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

$outputFile = Join-Path $distDir "ip-address-time-extension.zip"

if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

Push-Location $projectRoot

$files = @(
    "manifest.json",
    "background.js",
    "ip_sources.js",
    "options.html",
    "options.js",
    "popup.html",
    "popup.js",
    "styles.css",
    "time_utils.js",
    "test_verification.js",
    "icons"
)

try {
    Compress-Archive -Path $files -DestinationPath $outputFile -Force
    Write-Host "Extension packaged successfully to $outputFile"
}
finally {
    Pop-Location
}
