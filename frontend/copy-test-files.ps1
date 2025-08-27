# Script para copiar arquivos de teste para a pasta dist

Write-Host "Copiando arquivos de teste para a pasta dist..."

# Verificar se a pasta dist existe
if (-not (Test-Path "dist")) {
    Write-Host "Erro: A pasta dist não existe. Execute o build primeiro." -ForegroundColor Red
    exit 1
}

# Copiar arquivos de teste
Write-Host "Copiando test-render-routes.html..." -ForegroundColor Cyan
Copy-Item -Path "public\test-render-routes.html" -Destination "dist\test-render-routes.html" -Force

# Verificar se existem outros arquivos de teste e copiá-los
if (Test-Path "public\test-api-direct.html") {
    Write-Host "Copiando test-api-direct.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\test-api-direct.html" -Destination "dist\test-api-direct.html" -Force
}

if (Test-Path "public\test-login-simple.html") {
    Write-Host "Copiando test-login-simple.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\test-login-simple.html" -Destination "dist\test-login-simple.html" -Force
}

if (Test-Path "public\test-api-url.html") {
    Write-Host "Copiando test-api-url.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\test-api-url.html" -Destination "dist\test-api-url.html" -Force
}

if (Test-Path "public\cors-diagnostic.html") {
    Write-Host "Copiando cors-diagnostic.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\cors-diagnostic.html" -Destination "dist\cors-diagnostic.html" -Force
}

if (Test-Path "public\cors-test-new.html") {
    Write-Host "Copiando cors-test-new.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\cors-test-new.html" -Destination "dist\cors-test-new.html" -Force
}

if (Test-Path "public\cors-test.html") {
    Write-Host "Copiando cors-test.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\cors-test.html" -Destination "dist\cors-test.html" -Force
}

if (Test-Path "public\login-teste.html") {
    Write-Host "Copiando login-teste.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\login-teste.html" -Destination "dist\login-teste.html" -Force
}

if (Test-Path "public\test-local.html") {
    Write-Host "Copiando test-local.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\test-local.html" -Destination "dist\test-local.html" -Force
}

if (Test-Path "public\test-login-local.html") {
    Write-Host "Copiando test-login-local.html..." -ForegroundColor Cyan
    Copy-Item -Path "public\test-login-local.html" -Destination "dist\test-login-local.html" -Force
}

Write-Host "Arquivos de teste copiados com sucesso!" -ForegroundColor Green