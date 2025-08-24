# Instruções para Correção do CORS no Servidor de Produção

Os testes indicam que o servidor de produção (`https://rec2.onrender.com`) não está configurado corretamente para suportar credenciais CORS. Aqui estão as instruções para corrigir o problema:

## 1. Atualizar a Configuração CORS no Backend

Substitua a configuração CORS atual no arquivo `main.py` do servidor de produção pela seguinte configuração:

```python
# Configurar CORS para permitir requests do frontend com credenciais
cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "https://rec-frontend.vercel.app"],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "max_age": 3600
    }
})
```

## 2. Verificar a Configuração do Vercel

O arquivo `vercel.json` no frontend já está configurado corretamente com:

```json
{ "key": "Access-Control-Allow-Credentials", "value": "true" }
```

E a origem está corretamente definida como:

```json
{ "key": "Access-Control-Allow-Origin", "value": "https://rec-frontend.vercel.app" }
```

## 3. Verificar as Requisições no Frontend

Certifique-se de que todas as requisições no frontend incluam:

```javascript
{
  credentials: 'include',
  mode: 'cors'
}
```

Especialmente nas funções de login e verificação de token em `AuthContext.jsx`.

## 4. Implantar as Alterações

1. Faça commit das alterações no repositório
2. Implante as alterações no servidor de produção (Render)
3. Verifique se as alterações foram aplicadas usando o script `test_cors_production.py`

## 5. Testar a Autenticação

Após implantar as alterações, teste o login no frontend para verificar se a autenticação está funcionando corretamente.

## Problemas Comuns

1. **Erro 401 Unauthorized**: Este é o comportamento esperado para credenciais inválidas. Verifique se o servidor retorna 200 para credenciais válidas.

2. **Erro de CORS no navegador**: Verifique se o cabeçalho `Access-Control-Allow-Credentials` está presente nas respostas do servidor.

3. **Cookies não sendo enviados**: Verifique se o frontend está usando `credentials: 'include'` em todas as requisições.

4. **Erro de preflight**: Verifique se o servidor está respondendo corretamente às requisições OPTIONS.

## Verificação Final

Execute o script `test_cors_production.py` após as alterações para verificar se a configuração CORS está correta:

```bash
python test_cors_production.py
```

O script deve mostrar que o cabeçalho `Access-Control-Allow-Credentials` está presente nas respostas do servidor.