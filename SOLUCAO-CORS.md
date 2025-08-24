# Solução para Problemas de CORS no Projeto REC

## Alterações Realizadas

### 1. Backend (Flask)

No arquivo `src/main.py`, a configuração CORS foi atualizada para:

```python
# Configurar CORS para permitir requests do frontend com credenciais
CORS(app, origins=["http://localhost:3000", "https://rec-frontend.vercel.app"], supports_credentials=True)
```

Esta alteração:
- Especifica as origens permitidas (localhost para desenvolvimento e o domínio Vercel para produção)
- Ativa o suporte a credenciais (cookies, cabeçalhos de autenticação)

### 2. Frontend (Vercel)

No arquivo `frontend/vercel.json`, os cabeçalhos CORS foram atualizados:

```json
{
  "key": "Access-Control-Allow-Origin", 
  "value": "https://rec-frontend.vercel.app"
}
```

Esta alteração:
- Substitui o valor `*` por um domínio específico, necessário quando `credentials` está ativado
- Mantém a configuração `Access-Control-Allow-Credentials: true`

### 3. Requisições no Frontend

No arquivo `frontend/src/contexts/AuthContext.jsx`, as requisições foram atualizadas para incluir:

```javascript
{
  credentials: 'include',
  mode: 'cors',
  headers: {
    // Cabeçalhos de controle de cache...
  }
}
```

## Como Testar

1. Acesse a ferramenta de diagnóstico CORS: `frontend/cors-diagnostic.html`
2. Execute os testes diretos e via proxy para verificar se as requisições estão funcionando
3. Verifique no console do navegador se não há erros de CORS

## Problemas Comuns e Soluções

### Erro: "Access-Control-Allow-Origin" não pode ser "*" quando credenciais estão habilitadas

**Solução:** Especifique exatamente o domínio de origem em vez de usar `*`.

### Erro: Preflight OPTIONS falha

**Solução:** Verifique se o servidor está respondendo corretamente às requisições OPTIONS com os cabeçalhos CORS apropriados.

### Erro: Cookies não estão sendo enviados

**Solução:** Certifique-se de que:
- `credentials: 'include'` está definido nas requisições fetch
- `supports_credentials=True` está definido no backend
- Os cookies têm o atributo `SameSite` apropriado

## Configuração para Ambientes Adicionais

Se você precisar adicionar mais ambientes (como staging), adicione os domínios correspondentes à lista `origins` no backend:

```python
CORS(app, origins=["http://localhost:3000", "https://rec-frontend.vercel.app", "https://staging-rec.vercel.app"], supports_credentials=True)
```

## Referências

- [Documentação Flask-CORS](https://flask-cors.readthedocs.io/en/latest/)
- [MDN: CORS](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS)
- [Vercel: Headers](https://vercel.com/docs/concepts/projects/project-configuration#headers)