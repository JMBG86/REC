# Diagnóstico e Solução de Problemas CORS

## Introdução

Este documento fornece instruções detalhadas para diagnosticar e resolver problemas de CORS (Cross-Origin Resource Sharing) na aplicação REC. Os problemas de CORS ocorrem quando o frontend tenta acessar recursos do backend que estão em um domínio diferente, e as configurações de segurança do navegador bloqueiam essas requisições.

## Ferramenta de Diagnóstico

Foi criada uma ferramenta de diagnóstico CORS (`cors-diagnostic.html`) que permite testar diferentes aspectos da comunicação entre o frontend e o backend. Para usar a ferramenta:

1. Navegue até a pasta `frontend` do projeto
2. Abra o arquivo `cors-diagnostic.html` em um navegador
3. Use as diferentes abas e botões para testar a comunicação com o backend

## Problemas Comuns e Soluções

### 1. Erro de CORS no Preflight (OPTIONS)

**Sintoma**: O navegador mostra erros como "Access to fetch at 'https://rec2.onrender.com/api/auth/login' from origin 'https://seu-frontend.vercel.app' has been blocked by CORS policy".

**Solução**:

#### No Backend (Flask)

Verifique a configuração CORS no arquivo `main.py`:

```python
from flask_cors import CORS

# Problema: Permitir todas as origens com credenciais
CORS(app, origins="*", supports_credentials=True)  # INCORRETO

# Solução: Especificar origens exatas quando usar credentials
CORS(app, origins=["https://seu-frontend.vercel.app"], supports_credentials=True)  # CORRETO
```

**Importante**: Quando `supports_credentials=True`, você **não pode** usar `origins="*"`. Você deve especificar as origens exatas.

#### No Frontend (Vercel)

Verifique a configuração no arquivo `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "https://seu-frontend.vercel.app" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

**Nota**: O valor de `Access-Control-Allow-Origin` deve ser a origem exata do frontend, não `*`, quando estiver usando `Access-Control-Allow-Credentials: true`.

### 2. Problemas com Credenciais e Cookies

**Sintoma**: O login funciona, mas o usuário é desconectado imediatamente ou não consegue acessar rotas protegidas.

**Solução**:

#### No Backend

```python
CORS(app, origins=["https://seu-frontend.vercel.app"], supports_credentials=True)
```

#### No Frontend (fetch API)

```javascript
fetch('https://rec2.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // IMPORTANTE: Isso envia cookies
  mode: 'cors',
  body: JSON.stringify(data)
})
```

### 3. Problemas de Cache

**Sintoma**: As alterações nas configurações CORS não parecem ter efeito.

**Solução**:

1. Limpe o cache do navegador
2. Use cabeçalhos de controle de cache nas requisições:

```javascript
fetch(url, {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  // outras opções...
})
```

3. Adicione um timestamp às URLs para evitar cache:

```javascript
const timestamp = new Date().getTime();
const url = `${API_URL}/endpoint?_=${timestamp}`;
```

### 4. Usando um Proxy Reverso

Se você não conseguir modificar o backend, uma solução alternativa é usar o Vercel como proxy reverso:

```json
// vercel.json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://rec2.onrender.com/api/:path*" }
  ]
}
```

Isso permite que o frontend faça requisições para `/api/...` que serão redirecionadas para o backend, evitando problemas de CORS.

## Verificação Passo a Passo

1. **Verifique a configuração do backend**:
   - O CORS está habilitado?
   - As origens corretas estão permitidas?
   - `supports_credentials=True` está configurado (se necessário)?

2. **Verifique a configuração do frontend**:
   - As requisições fetch usam `credentials: 'include'`?
   - O modo CORS está explícito (`mode: 'cors'`)?
   - Os cabeçalhos de controle de cache estão configurados?

3. **Verifique o proxy Vercel** (se usado):
   - Os redirecionamentos estão configurados corretamente?
   - Os cabeçalhos CORS estão definidos?

4. **Use a ferramenta de diagnóstico**:
   - Teste a saúde da API
   - Teste o preflight CORS
   - Teste o login
   - Analise os cabeçalhos de resposta

## Configuração Recomendada

### Backend (Flask)

```python
# main.py
from flask_cors import CORS

# Para desenvolvimento (menos seguro)
CORS(app, origins=["http://localhost:3000", "https://seu-frontend.vercel.app"], supports_credentials=True)

# Para produção (mais seguro)
CORS(app, origins=["https://seu-frontend.vercel.app"], supports_credentials=True)
```

### Frontend (Vercel)

```json
// vercel.json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://rec2.onrender.com/api/:path*" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "https://seu-frontend.vercel.app" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, proxy-revalidate" },
        { "key": "Pragma", "value": "no-cache" },
        { "key": "Expires", "value": "0" }
      ]
    }
  ]
}
```

### Frontend (Fetch API)

```javascript
// AuthContext.jsx ou Login.jsx
async function login(username, password) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE}/auth/login?_=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error('Falha no login');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}
```

## Conclusão

Problemas de CORS podem ser complexos, mas seguindo este guia e usando a ferramenta de diagnóstico, você deve conseguir identificar e resolver a maioria dos problemas. Se persistirem, verifique se há firewalls, proxies ou outras configurações de rede que possam estar interferindo nas requisições.