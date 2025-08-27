#!/bin/bash

# Script para copiar arquivos de teste para a pasta dist

echo "Copiando arquivos de teste para a pasta dist..."

# Verificar se a pasta dist existe
if [ ! -d "dist" ]; then
    echo "Erro: A pasta dist não existe. Execute o build primeiro."
    exit 1
fi

# Copiar arquivos de teste
echo "Copiando test-render-routes.html..."
cp -f "public/test-render-routes.html" "dist/test-render-routes.html" 2>/dev/null || :

# Verificar se existem outros arquivos de teste e copiá-los
if [ -f "public/test-api-direct.html" ]; then
    echo "Copiando test-api-direct.html..."
    cp -f "public/test-api-direct.html" "dist/test-api-direct.html" 2>/dev/null || :
fi

# Copiar o novo arquivo de teste de URL da API
if [ -f "public/test-api-url.html" ]; then
    echo "Copiando test-api-url.html..."
    cp -f "public/test-api-url.html" "dist/test-api-url.html" 2>/dev/null || :
fi

if [ -f "public/test-login-simple.html" ]; then
    echo "Copiando test-login-simple.html..."
    cp -f "public/test-login-simple.html" "dist/test-login-simple.html" 2>/dev/null || :
fi

if [ -f "public/cors-test.html" ]; then
    echo "Copiando cors-test.html..."
    cp -f "public/cors-test.html" "dist/cors-test.html" 2>/dev/null || :
fi

if [ -f "public/login-teste.html" ]; then
    echo "Copiando login-teste.html..."
    cp -f "public/login-teste.html" "dist/login-teste.html" 2>/dev/null || :
fi

if [ -f "public/test-local.html" ]; then
    echo "Copiando test-local.html..."
    cp -f "public/test-local.html" "dist/test-local.html" 2>/dev/null || :
fi

if [ -f "public/cors-diagnostic.html" ]; then
    echo "Copiando cors-diagnostic.html..."
    cp -f "public/cors-diagnostic.html" "dist/cors-diagnostic.html" 2>/dev/null || :
fi

if [ -f "public/cors-test-new.html" ]; then
    echo "Copiando cors-test-new.html..."
    cp -f "public/cors-test-new.html" "dist/cors-test-new.html" 2>/dev/null || :
fi

if [ -f "public/test-login-local.html" ]; then
    echo "Copiando test-login-local.html..."
    cp -f "public/test-login-local.html" "dist/test-login-local.html" 2>/dev/null || :
fi

echo "Arquivos de teste copiados com sucesso!"