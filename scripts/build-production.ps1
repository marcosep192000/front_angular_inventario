$ErrorActionPreference = 'Stop'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js no está instalado o no está disponible en PATH.'
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm no está instalado o no está disponible en PATH.'
}

Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"

$nodeMajor = [int]((node --version).TrimStart('v').Split('.')[0])
if ($nodeMajor -notin @(18, 20)) {
  Write-Warning "Angular 17 se valida oficialmente con Node 18/20. Versión detectada: $(node --version). Para instalaciones reproducibles use Node 20 LTS."
}

npm ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci falló.' }

npm run build
if ($LASTEXITCODE -ne 0) { throw 'El build de producción falló.' }

$artifact = Join-Path $PSScriptRoot '..\dist\inventario-pixels\browser'
$index = Join-Path $artifact 'index.html'

if (-not (Test-Path -LiteralPath $index)) {
  throw "No se encontró index.html en el artefacto esperado: $artifact"
}

$indexContent = Get-Content -LiteralPath $index -Raw
if ($indexContent -notmatch '<base href="/">') {
  throw 'El index.html de producción no contiene <base href="/">.'
}

$javascriptBundles = Get-ChildItem -LiteralPath $artifact -Filter '*.js' -File
if (-not ($javascriptBundles | Select-String -Pattern '/api/v1/' -Quiet)) {
  throw 'No se encontró la base relativa /api/v1/ en los bundles de producción.'
}

@(
  'favicon.ico',
  'assets\fonts\material-icons.woff2',
  'assets\fonts\material-symbols-outlined.woff2'
) | ForEach-Object {
  if (-not (Test-Path -LiteralPath (Join-Path $artifact $_))) {
    throw "Falta un recurso obligatorio en el artefacto: $_"
  }
}

$externalReferences = Get-ChildItem -LiteralPath $artifact -File -Recurse |
  Where-Object { $_.Extension -in @('.html', '.css', '.js') } |
  Select-String -Pattern 'localhost:8080|127\.0\.0\.1|192\.168\.|C:\\Users\\|fonts\.googleapis\.com|fonts\.gstatic\.com'

if ($externalReferences) {
  throw "El artefacto contiene referencias no permitidas para producción LAN:`n$($externalReferences -join "`n")"
}

Write-Host ''
Write-Host 'FRONTEND BUILD READY' -ForegroundColor Green
Write-Host 'Artifact: dist/inventario-pixels/browser'
