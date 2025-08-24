#!/bin/bash

# Script para automatizar o deploy no Render.com

echo "Iniciando processo de deploy para o Render.com..."

# Verificar se o Git está instalado
if ! command -v git &> /dev/null; then
    echo "Erro: Git não está instalado. Por favor, instale o Git primeiro."
    exit 1
fi

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    echo "Erro: Este diretório não é um repositório Git. Execute 'git init' primeiro."
    exit 1
fi

# Adicionar todas as alterações ao Git
echo "Adicionando alterações ao Git..."
git add .

# Solicitar mensagem de commit
echo "Digite a mensagem de commit:"
read commit_message

# Realizar o commit
echo "Realizando commit..."
git commit -m "$commit_message"

# Verificar se o commit foi bem-sucedido
if [ $? -ne 0 ]; then
    echo "Erro ao realizar o commit. Verifique se há alterações para commit."
    exit 1
fi

# Solicitar o nome da branch remota
echo "Digite o nome da branch remota (geralmente 'main' ou 'master'):"
read branch_name

# Enviar para o repositório remoto
echo "Enviando para o repositório remoto..."
git push origin $branch_name

# Verificar se o push foi bem-sucedido
if [ $? -ne 0 ]; then
    echo "Erro ao enviar para o repositório remoto. Verifique suas credenciais e conexão."
    exit 1
fi

echo "Código enviado com sucesso para o GitHub!"
echo "O Render.com detectará automaticamente as alterações e iniciará o deploy."
echo "Acesse o painel do Render.com para acompanhar o progresso do deploy."

echo "Processo de deploy concluído!"