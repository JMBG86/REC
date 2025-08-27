# Sistema de Recuperação de Veículos - Frontend

## Sobre o Projeto

Este é o frontend do Sistema de Recuperação de Veículos, uma aplicação web desenvolvida para gerenciar e rastrear veículos desaparecidos ou roubados.

## Tecnologias Utilizadas

- React
- Vite
- React Router
- TailwindCSS
- Radix UI

## Configuração para Desenvolvimento

1. Instale as dependências:
   ```
   pnpm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```
   pnpm run dev
   ```

## Configuração para Produção

### Variáveis de Ambiente

Crie um arquivo `.env.production` com as seguintes variáveis:

```
VITE_API_BASE=/api
```

### Deploy no Render.com

O projeto está configurado para ser implantado no Render.com. Siga os passos abaixo para fazer o deploy:

1. Crie uma conta no [Render.com](https://render.com)
2. Conecte seu repositório GitHub ao Render
3. Crie um novo Web Service e selecione o repositório
4. Configure as seguintes opções:
   - **Nome**: rec-frontend
   - **Ambiente**: Static Site
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory**: `./dist`
   - **Variáveis de Ambiente**:
       - `NODE_VERSION`: 20.11.0
       - `VITE_API_BASE`: /api
 
 ### Scripts de Deploy

O projeto inclui scripts para facilitar o processo de deploy:

- **Windows**: Execute `deploy-render-frontend.ps1`
- **Linux/Mac**: Execute `deploy-render-frontend.sh`

Estes scripts garantem que todos os arquivos necessários sejam incluídos no build e fazem o commit e push das alterações para o GitHub, que por sua vez aciona o deploy automático no Render.com.

### Arquivos de Teste e Diagnóstico

O projeto inclui vários arquivos HTML para testar e diagnosticar problemas de conexão com a API:

- **test-api-direct.html**: Teste de conexão direta com a API, incluindo testes de login e verificação de saúde (health check)
- **cors-test.html**: Teste específico para problemas de CORS
- **login-teste.html**: Teste simplificado do processo de login

Para acessar estes arquivos no ambiente de produção, use as seguintes URLs:

- `https://rec-frontend-uha5.onrender.com/test-api-direct.html`
- `https://rec-frontend-uha5.onrender.com/cors-test.html`
- `https://rec-frontend-uha5.onrender.com/login-teste.html`

> **Nota**: Para que estes arquivos estejam disponíveis no ambiente de produção, eles devem estar no diretório `public/` antes do build. Os scripts de deploy mencionados acima garantem isso automaticamente.

5. Clique em "Create Web Service"

O Render irá automaticamente fazer o build e deploy da aplicação. Você pode acessar a aplicação através da URL fornecida pelo Render.

### Implantação no Vercel

1. Faça o fork ou clone deste repositório
2. Conecte o repositório ao Vercel
3. Configure as variáveis de ambiente no Vercel:
   - `VITE_API_BASE`: URL do backend em produção
4. O arquivo `vercel.json` já está configurado para redirecionar as requisições da API para o backend

## Estrutura do Projeto

- `src/`: Código fonte da aplicação
  - `components/`: Componentes React
  - `contexts/`: Contextos React (AuthContext, etc.)
  - `pages/`: Páginas da aplicação
  - `App.jsx`: Componente principal
  - `main.jsx`: Ponto de entrada da aplicação

## Funcionalidades

- Autenticação de usuários
- Painel de Controlo com estatísticas
- Gerenciamento de veículos
- Sistema de email triggers
- Geração de relatórios