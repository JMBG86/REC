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

O projeto utiliza as seguintes variáveis de ambiente:

- `VITE_API_BASE`: URL base da API (ex: https://rec-backend.onrender.com/api)

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