# Script para fazer deploy do frontend no Render.com

Write-Host "Iniciando deploy do frontend no Render.com..."

# Navegar para o diretório do frontend
Set-Location -Path "$PSScriptRoot"

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Não foi possível encontrar o arquivo package.json. Verifique se você está no diretório do frontend." -ForegroundColor Red
    exit 1
}

# Executar o build
Write-Host "Executando build do frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro: Falha ao executar o build do frontend." -ForegroundColor Red
    exit 1
}

Write-Host "Build concluído com sucesso!" -ForegroundColor Green

# Verificar se o arquivo test-api-direct.html está no diretório public
if (-not (Test-Path "public/test-api-direct.html")) {
    Write-Host "Aviso: O arquivo test-api-direct.html não foi encontrado no diretório public." -ForegroundColor Yellow
    
    # Verificar se existe na raiz e copiar se necessário
    if (Test-Path "test-api-direct.html") {
        Write-Host "Copiando test-api-direct.html da raiz para o diretório public..." -ForegroundColor Cyan
        Copy-Item -Path "test-api-direct.html" -Destination "public/test-api-direct.html"
        Write-Host "Arquivo copiado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Erro: O arquivo test-api-direct.html não foi encontrado na raiz do projeto." -ForegroundColor Red
    }
}

Write-Host "Verificando se o arquivo test-api-direct.html está no diretório dist..." -ForegroundColor Cyan
if (-not (Test-Path "dist/test-api-direct.html") -and (Test-Path "public/test-api-direct.html")) {
    Write-Host "Copiando test-api-direct.html do diretório public para o diretório dist..." -ForegroundColor Cyan
    Copy-Item -Path "public/test-api-direct.html" -Destination "dist/test-api-direct.html"
    Write-Host "Arquivo copiado com sucesso!" -ForegroundColor Green
}

Write-Host "Deploy local concluído!" -ForegroundColor Green
Write-Host "Para fazer o deploy no Render.com, faça commit e push das alterações para o GitHub." -ForegroundColor Cyan
Write-Host "O Render.com irá detectar as alterações e fazer o deploy automaticamente." -ForegroundColor Cyan

# Perguntar se deseja fazer commit e push
$resposta = Read-Host "Deseja fazer commit e push das alterações para o GitHub? (S/N)"

if ($resposta -eq "S" -or $resposta -eq "s") {
    # Verificar se estamos em um repositório Git
    if (-not (Test-Path ".git")) {
        Write-Host "Erro: Não foi possível encontrar o diretório .git. Verifique se você está em um repositório Git." -ForegroundColor Red
        exit 1
    }
    
    # Adicionar as alterações
    Write-Host "Adicionando alterações..." -ForegroundColor Cyan
    git add .
    
    # Fazer commit
    $mensagem = Read-Host "Digite a mensagem do commit"
    Write-Host "Fazendo commit..." -ForegroundColor Cyan
    git commit -m $mensagem
    
    # Fazer push
    Write-Host "Fazendo push..." -ForegroundColor Cyan
    git push
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro: Falha ao fazer push das alterações." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Commit e push concluídos com sucesso!" -ForegroundColor Green
    Write-Host "O Render.com irá detectar as alterações e fazer o deploy automaticamente." -ForegroundColor Cyan
    Write-Host "Você pode acompanhar o progresso do deploy no painel do Render.com." -ForegroundColor Cyan
}

Write-Host "Processo concluído!" -ForegroundColor Green