# run-backend.ps1
# Downloads Maven if not available, then starts the Spring Boot backend

$MAVEN_VERSION = "3.9.6"
$MAVEN_DIR = "$PSScriptRoot\.maven\apache-maven-$MAVEN_VERSION"
$MAVEN_ZIP = "$PSScriptRoot\.maven\apache-maven-$MAVEN_VERSION-bin.zip"
$MAVEN_URL = "https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"
$MVN_CMD = "$MAVEN_DIR\bin\mvn.cmd"

# Check if Maven is already in PATH
$mvnInPath = Get-Command mvn -ErrorAction SilentlyContinue
if ($mvnInPath) {
    Write-Host "✅ Maven found in PATH: $($mvnInPath.Source)" -ForegroundColor Green
    $MVN_CMD = "mvn"
}
# Check if we already downloaded Maven locally
elseif (Test-Path $MVN_CMD) {
    Write-Host "✅ Using local Maven at: $MAVEN_DIR" -ForegroundColor Green
}
# Download Maven
else {
    Write-Host "⬇️  Maven not found. Downloading Maven $MAVEN_VERSION..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "$PSScriptRoot\.maven" -Force | Out-Null

    try {
        Invoke-WebRequest -Uri $MAVEN_URL -OutFile $MAVEN_ZIP -UseBasicParsing
        Write-Host "📦 Extracting Maven..." -ForegroundColor Yellow
        Expand-Archive -Path $MAVEN_ZIP -DestinationPath "$PSScriptRoot\.maven" -Force
        Remove-Item $MAVEN_ZIP
        Write-Host "✅ Maven $MAVEN_VERSION ready!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download Maven: $_" -ForegroundColor Red
        Write-Host "👉 Please install Maven manually: https://maven.apache.org/download.cgi" -ForegroundColor Cyan
        exit 1
    }
}

# Start the Spring Boot backend
Write-Host ""
Write-Host "🚀 Starting Spring Boot Backend on http://localhost:8080 ..." -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot
& $MVN_CMD spring-boot:run
