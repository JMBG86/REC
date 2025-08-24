# Script PowerShell para automatizar o deploy no Render.com

Write-Host "Iniciando processo de deploy para o Render.com..." -ForegroundColor Cyan

# Verificar se o Git está instalado
try {
    git --version | Out-Null
} catch {
    Write-Host "Erro: Git não está instalado. Por favor, instale o Git primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se estamos em um repositório Git
if (-not (Test-Path ".git")) {
    Write-Host "Erro: Este diretório não é um repositório Git. Execute 'git init' primeiro." -ForegroundColor Red
    exit 1
}

# Adicionar todas as alterações ao Git
Write-Host "Adicionando alterações ao Git..." -ForegroundColor Yellow
git add .

# Solicitar mensagem de commit
$commit_message = Read-Host "Digite a mensagem de commit"

# Realizar o commit
Write-Host "Realizando commit..." -ForegroundColor Yellow
git commit -m "$commit_message"

# Verificar se o commit foi bem-sucedido
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao realizar o commit. Verifique se há alterações para commit." -ForegroundColor Red
    exit 1
}

# Solicitar o nome da branch remota
$branch_name = Read-Host "Digite o nome da branch remota (geralmente 'main' ou 'master')"

# Enviar para o repositório remoto
Write-Host "Enviando para o repositório remoto..." -ForegroundColor Yellow
git push origin $branch_name

# Verificar se o push foi bem-sucedido
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao enviar para o repositório remoto. Verifique suas credenciais e conexão." -ForegroundColor Red
    exit 1
}

Write-Host "Código enviado com sucesso para o GitHub!" -ForegroundColor Green
Write-Host "O Render.com detectará automaticamente as alterações e iniciará o deploy." -ForegroundColor Green
Write-Host "Acesse o painel do Render.com para acompanhar o progresso do deploy." -ForegroundColor Green

Write-Host "Processo de deploy concluído!" -ForegroundColor Cyan

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")