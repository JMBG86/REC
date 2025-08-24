# Guia de Implantação no Render.com

Este guia fornece instruções para implantar o projeto REC no Render.com, tanto o backend quanto o frontend.

## Estrutura do Projeto

O projeto consiste em duas partes principais:

1. **Backend (Flask)**: API REST que gerencia a lógica de negócios e acesso ao banco de dados
2. **Frontend (React/Vite)**: Interface de usuário que consome a API do backend

## Configuração do Render.com

### Backend

1. Crie um novo serviço Web no Render.com
2. Conecte ao repositório Git
3. Configure as seguintes opções:
   - **Nome**: rec-backend (ou outro nome de sua escolha)
   - **Ambiente**: Python
   - **Comando de Build**: `pip install -r requirements.txt`
   - **Comando de Início**: `PYTHONPATH=$PYTHONPATH:/opt/render/project gunicorn -c gunicorn_config.py 'src.main:app'`
   - **Variáveis de Ambiente**:
     - `PYTHON_VERSION`: 3.11.0
     - `SECRET_KEY`: (gerar um valor seguro)
     - `DATABASE_URL`: (URL do seu banco de dados)
     - `MAX_CONTENT_LENGTH`: 16777216 (16MB em bytes)

### Frontend

1. Crie um novo serviço Static Site no Render.com
2. Conecte ao mesmo repositório Git
3. Configure as seguintes opções:
   - **Nome**: rec-frontend (ou outro nome de sua escolha)
   - **Diretório de Publicação**: `frontend/dist`
   - **Comando de Build**: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - **Variáveis de Ambiente**:
     - `NODE_VERSION`: 20.11.0
     - `VITE_API_BASE`: https://[nome-do-seu-backend].onrender.com/api

## Configuração CORS

O backend já está configurado para aceitar requisições CORS do frontend hospedado no Render.com. As seguintes origens estão permitidas:

- `http://localhost:3000` (desenvolvimento local)
- `http://localhost:5173` (desenvolvimento local com Vite)
- `https://rec-frontend.onrender.com` (frontend no Render.com)
- `https://rec-ub72.onrender.com` (frontend no Render.com)

A configuração CORS foi simplificada para melhorar a segurança, removendo o wildcard `*` e limitando as origens apenas aos domínios necessários.

## Proxy Reverso

O frontend está configurado para usar um proxy reverso para as requisições à API, redirecionando todas as chamadas de `/api/*` para o backend. Isso é configurado nos arquivos `render.yaml` e `render.json` no diretório `frontend/`.

## Sistema de Login Simplificado

O sistema de login foi otimizado para melhorar a experiência do usuário e reduzir problemas de CORS:

1. **Configuração da API**: O arquivo `api.js` foi atualizado para usar a URL correta da API em produção e desenvolvimento.
2. **Remoção de verificações redundantes**: Foram removidas verificações de preflight CORS desnecessárias no componente de login.
3. **Simplificação do processo de autenticação**: O fluxo de login foi otimizado para reduzir logs desnecessários e melhorar o desempenho.
4. **Cabeçalhos CORS específicos**: Os cabeçalhos CORS foram atualizados para permitir apenas as origens necessárias, melhorando a segurança.

## Verificação da Implantação

Após a implantação, verifique se:

1. O backend está respondendo em `https://[nome-do-seu-backend].onrender.com/api/health`
2. O frontend está carregando em `https://[nome-do-seu-frontend].onrender.com`
3. O login e outras funcionalidades que requerem comunicação com o backend estão funcionando corretamente

## Solução de Problemas

Se encontrar problemas de CORS:

1. Verifique se a URL do backend está correta no arquivo `.env.production` do frontend
2. Verifique se a URL do frontend está incluída na lista de origens permitidas no arquivo `main.py` do backend
3. Verifique os logs do backend e do frontend no painel do Render.com para identificar possíveis erros

## Scripts de Deploy

Foram criados scripts para facilitar o processo de deploy no Render.com:

1. **deploy-render.sh** - Script Bash para sistemas Unix/Linux/macOS
2. **deploy-render.ps1** - Script PowerShell para sistemas Windows

Estes scripts automatizam o processo de commit e push para o GitHub, que por sua vez aciona o deploy automático no Render.com. Para usar o script no Windows, execute o seguinte comando no PowerShell:

```powershell
.\deploy-render.ps1
```

O script irá solicitar uma mensagem de commit e o nome da branch para push.

## Implantação Manual

Se os deploys automáticos não estiverem funcionando, você pode iniciar um deploy manual:

1. Acesse o painel do Render.com
2. Navegue até o serviço (backend ou frontend)
3. Clique em "Manual Deploy" e selecione "Deploy latest commit"

Isso forçará o Render.com a implantar a versão mais recente do código do repositório Git.