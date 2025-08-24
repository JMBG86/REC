# Solução de Problemas CORS no Projeto REC

## Visão Geral

Este documento fornece instruções para testar e verificar a solução dos problemas de CORS (Cross-Origin Resource Sharing) no projeto REC. As alterações realizadas permitem que o frontend se comunique corretamente com o backend, respeitando as políticas de segurança dos navegadores.

## Alterações Realizadas

1. **Backend (Flask)**
   - Configuração CORS atualizada para permitir origens específicas
   - Habilitado suporte a credenciais

2. **Frontend (Vercel)**
   - Cabeçalhos CORS atualizados para especificar a origem exata
   - Configuração de requisições para incluir credenciais

3. **Requisições no Frontend**
   - Adicionado `credentials: 'include'` e `mode: 'cors'` nas requisições fetch
   - Implementado controle de cache para evitar problemas com requisições em cache

## Como Testar

### 1. Teste no Backend

Execute o script de teste CORS no backend:

```bash
cd src
pip install requests colorama
python test_cors.py
```

Este script verifica:
- Endpoint de saúde (`/health`)
- Preflight CORS (`OPTIONS /auth/login`)
- Login com CORS (`POST /auth/login`)

### 2. Teste no Frontend

1. Abra a aplicação no navegador
2. Abra o console do desenvolvedor (F12)
3. Cole o conteúdo do arquivo `frontend/test-cors-frontend.js` no console e pressione Enter

O script executará testes de:
- Conexão com o endpoint de saúde
- Preflight CORS
- Login com CORS

### 3. Ferramenta de Diagnóstico CORS

Use a ferramenta de diagnóstico CORS para uma análise mais detalhada:

1. Abra o arquivo `frontend/cors-diagnostic.html` no navegador
2. Execute os testes disponíveis na interface

## Solução de Problemas

Se ainda houver problemas de CORS, verifique:

1. **Cabeçalhos de Resposta do Backend**
   - `Access-Control-Allow-Origin` deve corresponder exatamente ao domínio do frontend
   - `Access-Control-Allow-Credentials` deve ser `true`
   - `Access-Control-Allow-Methods` deve incluir os métodos necessários
   - `Access-Control-Allow-Headers` deve incluir os cabeçalhos necessários

2. **Configuração do Frontend**
   - Verifique se `credentials: 'include'` está presente em todas as requisições
   - Verifique se os cabeçalhos de controle de cache estão corretos

3. **Problemas de Cache**
   - Limpe o cache do navegador
   - Use parâmetros de consulta com timestamp para evitar cache

## Documentação Adicional

Para mais detalhes sobre a solução implementada, consulte:

- `SOLUCAO-CORS.md` - Detalhes técnicos das alterações realizadas
- `CORS-DIAGNOSTICO.md` - Guia para diagnóstico e solução de problemas de CORS

## Referências

- [MDN: CORS](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS)
- [Flask-CORS](https://flask-cors.readthedocs.io/en/latest/)
- [Fetch API com CORS](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch)