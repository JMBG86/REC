#!/bin/bash

# Script para fazer deploy do frontend no Render.com

echo "Iniciando deploy do frontend no Render.com..."

# Navegar para o diretório do frontend
cd "$(dirname "$0")"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "Erro: Não foi possível encontrar o arquivo package.json. Verifique se você está no diretório do frontend."
    exit 1
fi

# Executar o build
echo "Executando build do frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "Erro: Falha ao executar o build do frontend."
    exit 1
fi

echo "Build concluído com sucesso!"

# Verificar se o arquivo test-api-direct.html está no diretório public
if [ ! -f "public/test-api-direct.html" ]; then
    echo "Aviso: O arquivo test-api-direct.html não foi encontrado no diretório public."
    
    # Verificar se existe na raiz e copiar se necessário
    if [ -f "test-api-direct.html" ]; then
        echo "Copiando test-api-direct.html da raiz para o diretório public..."
        cp "test-api-direct.html" "public/test-api-direct.html"
        echo "Arquivo copiado com sucesso!"
    else
        echo "Erro: O arquivo test-api-direct.html não foi encontrado na raiz do projeto."
    fi
fi

# Copiar arquivos de teste para a pasta dist
echo "Copiando arquivos de teste para a pasta dist..."
chmod +x ./copy-test-files.sh
./copy-test-files.sh

echo "Verificando se o arquivo test-api-direct.html está no diretório dist..."
if [ ! -f "dist/test-api-direct.html" ] && [ -f "public/test-api-direct.html" ]; then
    echo "Copiando test-api-direct.html do diretório public para o diretório dist..."
    cp "public/test-api-direct.html" "dist/test-api-direct.html"
    echo "Arquivo copiado com sucesso!"
fi

echo "Deploy local concluído!"
echo "Para fazer o deploy no Render.com, faça commit e push das alterações para o GitHub."
echo "O Render.com irá detectar as alterações e fazer o deploy automaticamente."

# Perguntar se deseja fazer commit e push
read -p "Deseja fazer commit e push das alterações para o GitHub? (S/N) " resposta

if [ "$resposta" = "S" ] || [ "$resposta" = "s" ]; then
    # Verificar se estamos em um repositório Git
    if [ ! -d ".git" ]; then
        echo "Erro: Não foi possível encontrar o diretório .git. Verifique se você está em um repositório Git."
        exit 1
    fi
    
    # Adicionar as alterações
    echo "Adicionando alterações..."
    git add .
    
    # Fazer commit
    read -p "Digite a mensagem do commit: " mensagem
    echo "Fazendo commit..."
    git commit -m "$mensagem"
    
    # Fazer push
    echo "Fazendo push..."
    git push
    
    if [ $? -ne 0 ]; then
        echo "Erro: Falha ao fazer push das alterações."
        exit 1
    fi
    
    echo "Commit e push concluídos com sucesso!"
    echo "O Render.com irá detectar as alterações e fazer o deploy automaticamente."
    echo "Você pode acompanhar o progresso do deploy no painel do Render.com."
fi

echo "Processo concluído!"