# Migração do Vercel para o Render.com

Este documento descreve o processo de migração do projeto REC do Vercel para o Render.com.

## Por que migrar para o Render.com?

O Render.com oferece uma plataforma unificada para hospedar tanto o backend quanto o frontend, simplificando o gerenciamento da infraestrutura e reduzindo a complexidade da configuração de CORS entre diferentes plataformas.

## Arquivos removidos relacionados ao Vercel

Os seguintes arquivos relacionados ao Vercel foram removidos do projeto:

- `vercel.json` - Configuração principal do Vercel
- `.vercel/` - Diretório de configuração do Vercel
- `.vercelignore` - Arquivo que especifica quais arquivos o Vercel deve ignorar

## Configurações atualizadas

### Backend (Flask)

O backend está configurado para aceitar requisições CORS do frontend hospedado no Render.com. As seguintes origens estão permitidas:

- `http://localhost:3000` (desenvolvimento local)
- `http://localhost:5173` (desenvolvimento local com Vite)
- `https://rec-frontend.onrender.com` (frontend no Render.com)
- `https://rec-ub72.onrender.com` (frontend no Render.com)

A configuração CORS foi simplificada para melhorar a segurança, removendo o wildcard `*` e limitando as origens apenas aos domínios necessários.

### Frontend (React/Vite)

O frontend está configurado para usar um proxy reverso para as requisições à API, redirecionando todas as chamadas de `/api/*` para o backend. Isso é configurado nos arquivos `render.yaml` e `render.json` no diretório `frontend/`.

### Sistema de Login Simplificado

O sistema de login foi simplificado para melhorar a experiência do usuário e reduzir problemas de CORS:

1. **Configuração da API**: O arquivo `api.js` foi atualizado para usar a URL correta da API em produção e desenvolvimento.
2. **Remoção de verificações redundantes**: Foram removidas verificações de preflight CORS desnecessárias no componente de login.
3. **Simplificação do processo de autenticação**: O fluxo de login foi otimizado para reduzir logs desnecessários e melhorar o desempenho.
4. **Cabeçalhos CORS específicos**: Os cabeçalhos CORS foram atualizados para permitir apenas as origens necessárias, melhorando a segurança.

## Scripts de Deploy

Foram criados dois scripts para facilitar o processo de deploy no Render.com:

1. **deploy-render.sh** - Script Bash para sistemas Unix/Linux/macOS
2. **deploy-render.ps1** - Script PowerShell para sistemas Windows

Estes scripts automatizam o processo de commit e push para o GitHub, que por sua vez aciona o deploy automático no Render.com. Para usar o script no Windows, execute o seguinte comando no PowerShell:

```powershell
.\deploy-render.ps1
```

## Arquivos de configuração do Render.com

### `render.yaml` (raiz do projeto)

Este arquivo configura os serviços do backend e do frontend no Render.com:

```yaml
services:
  - type: web
    name: rec-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: PYTHONPATH=$PYTHONPATH:/opt/render/project gunicorn -c gunicorn_config.py 'src.main:app'
    envVars:
      - key: PYTHON_VERSION
        value: "3.11.0"
      - key: SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        sync: false
      - key: MAX_CONTENT_LENGTH
        fromString: "16777216"  # 16MB em bytes

  - type: web
    name: rec-frontend
    env: node
    buildCommand: cd frontend && npm install --legacy-peer-deps && npm run build
    startCommand: cd frontend && npm run preview -- --host 0.0.0.0 --port $PORT
    envVars:
      - key: NODE_VERSION
        value: "20.11.0"
      - key: VITE_API_BASE
        value: "https://rec-ub72.onrender.com/api"
    routes:
      - type: rewrite
        source: /api/*
        destination: https://rec-ub72.onrender.com/api/:splat
```

### `render.yaml` (diretório frontend)

Este arquivo configura o serviço do frontend como um site estático no Render.com:

```yaml
services:
  - type: web
    name: rec-frontend
    env: static
    buildCommand: npm install --legacy-peer-deps && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: NODE_VERSION
        value: "20.11.0"
    headers:
      - path: /api/(.*)
        name: Access-Control-Allow-Origin
        value: "https://rec-ub72.onrender.com"
      - path: /api/(.*)
        name: Access-Control-Allow-Methods
        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT"
      - path: /api/(.*)
        name: Access-Control-Allow-Headers
        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
      - path: /api/(.*)
        name: Access-Control-Allow-Credentials
        value: "true"
    routes:
      - type: rewrite
        source: /api/(.*)
        destination: https://rec-ub72.onrender.com/api/$1
      - type: rewrite
        source: /*
        destination: /index.html
```

### `render.json` (diretório frontend)

Este arquivo fornece configurações adicionais para o serviço do frontend no Render.com:

```json
{
  "buildCommand": "npm install && npm run build",
  "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, proxy-revalidate" },
        { "key": "Pragma", "value": "no-cache" },
        { "key": "Expires", "value": "0" },
        { "key": "Vary", "value": "Origin" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        { "key": "Vary", "value": "Origin" }
      ]
    }
  ],
  "routes": [
    { "source": "/api/:path*", "destination": "https://rec-ub72.onrender.com/api/:path*" }
  ]
}
```

## Variáveis de ambiente

### `.env.production` (diretório frontend)

Este arquivo configura a URL base da API para o ambiente de produção:

```
VITE_API_BASE=https://rec-ub72.onrender.com/api
```

## Passos para completar a migração

1. Remova todos os arquivos relacionados ao Vercel (já feito)
2. Atualize as configurações do Render.com (já feito)
3. Faça o commit das alterações para o repositório Git
4. Crie os serviços no Render.com conforme descrito no arquivo `DEPLOY-RENDER.md`
5. Configure as variáveis de ambiente necessárias no Render.com
6. Inicie o deploy dos serviços no Render.com
7. Verifique se o frontend e o backend estão funcionando corretamente
8. Atualize as URLs nos documentos e no código, se necessário

## Solução de problemas

Se encontrar problemas de CORS:

1. Verifique se a URL do backend está correta no arquivo `.env.production` do frontend
2. Verifique se a URL do frontend está incluída na lista de origens permitidas no arquivo `main.py` do backend
3. Verifique os logs do backend e do frontend no painel do Render.com para identificar possíveis erros

## Referências

- [Documentação do Render.com](https://render.com/docs)
- [Guia de implantação no Render.com](./DEPLOY-RENDER.md)